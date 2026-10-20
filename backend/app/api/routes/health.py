from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health", summary="Service health", description="Returns service and model availability without exposing paths.")
def health(request: Request) -> dict:
    service = request.app.state.prediction_service
    loaded = service.model_service.is_loaded and service.preprocessing_service.is_loaded
    return {"success": True, "status": "healthy", "model": "loaded" if loaded else "unavailable"}
