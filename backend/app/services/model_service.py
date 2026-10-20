import logging
from pathlib import Path

import numpy as np
import torch

from app.ml.feature_definition import MODEL_FEATURES
from app.ml.model_definition import ANN
from app.utils.errors import ModelUnavailableError, PredictionError

logger = logging.getLogger(__name__)


class ModelService:
    def __init__(self, model_path: Path) -> None:
        self.model_path = Path(model_path)
        self.device = torch.device("cpu")
        self.model: ANN | None = None
        self.load_error: str | None = None

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def load_model(self) -> None:
        if not self.model_path.is_file():
            self.load_error = "Model artifact is not present."
            logger.warning("PyTorch model artifact is unavailable.")
            return
        try:
            model = ANN(features=len(MODEL_FEATURES), no_of_rep=1, expands=8, drp_rate=0.0)
            try:
                state_dict = torch.load(self.model_path, map_location=self.device, weights_only=True)
            except TypeError:
                state_dict = torch.load(self.model_path, map_location=self.device)
            model.load_state_dict(state_dict, strict=True)
            self.model = model.to(self.device).eval()
            self.load_error = None
            logger.info("PyTorch prediction model loaded.")
        except Exception:
            self.model = None
            self.load_error = "Model artifact could not be loaded."
            logger.exception("PyTorch model loading failed.")

    def predict(self, scaled_features: np.ndarray) -> tuple[int, float]:
        if self.model is None:
            raise ModelUnavailableError("The prediction model is currently unavailable.")
        try:
            tensor = torch.tensor(scaled_features, dtype=torch.float32, device=self.device)
            with torch.inference_mode():
                probability = float(self.model(tensor).item())
            if not 0.0 <= probability <= 1.0:
                raise ValueError("Model output is outside the expected probability range.")
            return int(probability >= 0.5), round(probability * 100, 2)
        except Exception as exc:
            logger.exception("PyTorch inference failed.")
            raise PredictionError("Model inference could not be completed.") from exc
