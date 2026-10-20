from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_prediction_service
from app.schemas.prediction import ErrorResponse, PredictionRequest, PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/prediction", tags=["prediction"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={422: {"model": ErrorResponse}, 503: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    status_code=status.HTTP_200_OK,
    summary="Run an Alzheimer's research-model inference",
    description="Research prototype only. This endpoint returns a model probability and is not a medical diagnosis.",
)
def predict(
    payload: PredictionRequest,
    service: PredictionService = Depends(get_prediction_service),
) -> PredictionResponse:
    return PredictionResponse(data=service.predict(payload))
