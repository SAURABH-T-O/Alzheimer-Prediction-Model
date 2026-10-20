import logging

from app.schemas.prediction import PredictionData, PredictionRequest
from app.services.model_service import ModelService
from app.services.preprocessing_service import PreprocessingService

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(self, model_service: ModelService, preprocessing_service: PreprocessingService) -> None:
        self.model_service = model_service
        self.preprocessing_service = preprocessing_service

    def predict(self, request: PredictionRequest) -> PredictionData:
        logger.info("Prediction request received.")
        scaled_features = self.preprocessing_service.prepare(request)
        prediction, probability = self.model_service.predict(scaled_features)
        logger.info("Prediction completed.")
        return PredictionData(probability=probability, prediction=prediction)
