import logging
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms

from app.ml.mri_model_definition import BrainScanCNN
from app.utils.errors import ModelUnavailableError, PredictionError

logger = logging.getLogger(__name__)


class MriModelService:
    class_labels = {
        0: "Non-Demented",
        1: "Very Mild Demented",
        2: "Mild Demented",
        3: "Moderate Demented",
    }

    def __init__(self, model_path: Path) -> None:
        self.model_path = Path(model_path)
        self.device = torch.device("cpu")
        self.model: BrainScanCNN | None = None
        self.load_error: str | None = None
        self.transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor()])

    def load_model(self) -> None:
        if not self.model_path.is_file():
            self.load_error = "MRI model artifact is not present."
            logger.warning("MRI model artifact is unavailable.")
            return
        try:
            model = BrainScanCNN(num_classes=4).to(self.device)
            try:
                state_dict = torch.load(self.model_path, map_location=self.device, weights_only=True)
            except TypeError:
                state_dict = torch.load(self.model_path, map_location=self.device)
            model.load_state_dict(state_dict, strict=True)
            self.model = model.eval()
            self.load_error = None
            logger.info("MRI prediction model loaded.")
        except Exception:
            self.model = None
            self.load_error = "MRI model artifact could not be loaded."
            logger.exception("MRI model loading failed.")

    def predict(self, file_bytes: bytes) -> dict[str, int | str]:
        if self.model is None:
            raise ModelUnavailableError("The MRI prediction model is currently unavailable.")
        try:
            image = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("The uploaded file is not a readable image.")
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, threshold = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY)
            threshold = cv2.erode(threshold, None, iterations=2)
            threshold = cv2.dilate(threshold, None, iterations=2)
            contours, _ = cv2.findContours(threshold.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                x, y, width, height = cv2.boundingRect(max(contours, key=cv2.contourArea))
                image = image[y:y + height, x:x + width]
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            tensor = self.transform(Image.fromarray(rgb_image)).unsqueeze(0).to(self.device)
            with torch.inference_mode():
                class_index = int(torch.argmax(self.model(tensor), dim=1).item())
            predicted_stage = self.class_labels[class_index]
            return {
                "dementia_detected": "Yes" if class_index > 0 else "No",
                "predicted_stage": predicted_stage,
                "class_index": class_index,
            }
        except (ModelUnavailableError, ValueError):
            raise
        except Exception as exc:
            logger.exception("MRI inference failed.")
            raise PredictionError("MRI inference could not be completed.") from exc
