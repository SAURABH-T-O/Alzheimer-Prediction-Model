import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, prediction
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.services.model_service import ModelService
from app.services.prediction_service import PredictionService
from app.services.preprocessing_service import PreprocessingService
from app.utils.errors import ModelUnavailableError, PredictionError

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    preprocessing_service = PreprocessingService(settings.scaler_path)
    preprocessing_service.load_scaler()
    model_service = ModelService(settings.model_path)
    model_service.load_model()
    app.state.model_service = model_service
    app.state.prediction_service = PredictionService(model_service, preprocessing_service)
    logger.info("AlzAI API started.")
    yield
    logger.info("AlzAI API stopped.")


app = FastAPI(
    title="AlzAI Prediction API",
    version="1.0.0",
    description="Alzheimer's cognitive-risk research prototype. Output is not a medical diagnosis.",
    lifespan=lifespan,
)

cors_origins = list(dict.fromkeys([
    settings.frontend_url,
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(health.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Invalid prediction input."}})


@app.exception_handler(ModelUnavailableError)
async def model_unavailable_handler(_: Request, __: ModelUnavailableError) -> JSONResponse:
    return JSONResponse(status_code=503, content={"success": False, "error": {"code": "MODEL_UNAVAILABLE", "message": "Prediction model is unavailable."}})


@app.exception_handler(PredictionError)
async def prediction_error_handler(_: Request, __: PredictionError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"success": False, "error": {"code": "PREDICTION_ERROR", "message": "Prediction could not be completed."}})


@app.exception_handler(Exception)
async def unexpected_error_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled API error.", exc_info=exc)
    return JSONResponse(status_code=500, content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "An unexpected server error occurred."}})
