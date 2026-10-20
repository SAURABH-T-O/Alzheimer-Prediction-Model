import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.ml.feature_definition import MODEL_FEATURES
from app.schemas.prediction import PredictionRequest
from app.utils.errors import ModelUnavailableError, PredictionError

logger = logging.getLogger(__name__)


class PreprocessingService:
    def __init__(self, scaler_path: Path) -> None:
        self.scaler_path = Path(scaler_path)
        self.scaler = None

    @property
    def is_loaded(self) -> bool:
        return self.scaler is not None

    def load_scaler(self) -> None:
        if not self.scaler_path.is_file():
            logger.warning("Scaler artifact is unavailable.")
            return
        try:
            scaler = joblib.load(self.scaler_path)
            if getattr(scaler, "n_features_in_", None) != len(MODEL_FEATURES):
                raise ValueError("Scaler feature count does not match the model contract.")
            stored_names = tuple(getattr(scaler, "feature_names_in_", ()))
            if stored_names and stored_names != MODEL_FEATURES:
                raise ValueError("Scaler feature order does not match the model contract.")
            self.scaler = scaler
            logger.info("Prediction scaler loaded.")
        except Exception:
            self.scaler = None
            logger.exception("Scaler loading failed.")

    def prepare(self, request: PredictionRequest) -> np.ndarray:
        if self.scaler is None:
            raise ModelUnavailableError("The preprocessing artifact is currently unavailable.")
        values = request.model_dump()
        try:
            frame = pd.DataFrame([[values[name] for name in MODEL_FEATURES]], columns=MODEL_FEATURES, dtype=float)
            return self.scaler.transform(frame)
        except Exception as exc:
            logger.exception("Feature preprocessing failed.")
            raise PredictionError("Prediction input could not be processed.") from exc
