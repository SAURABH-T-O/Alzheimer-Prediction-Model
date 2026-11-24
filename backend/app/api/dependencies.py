from fastapi import Request

from app.services.prediction_service import PredictionService
from app.services.mri_model_service import MriModelService


def get_prediction_service(request: Request) -> PredictionService:
    return request.app.state.prediction_service


def get_mri_model_service(request: Request) -> MriModelService:
    return request.app.state.mri_model_service
