from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_mri_model_service
from app.services.mri_model_service import MriModelService

router = APIRouter(prefix="/prediction", tags=["prediction"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


@router.post("/mri", status_code=status.HTTP_200_OK)
async def predict_mri(
    image: UploadFile = File(...),
    service: MriModelService = Depends(get_mri_model_service),
) -> dict:
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")
    image_bytes = await image.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="The image must be 10 MB or smaller.")
    try:
        return {"success": True, "data": service.predict(image_bytes)}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
