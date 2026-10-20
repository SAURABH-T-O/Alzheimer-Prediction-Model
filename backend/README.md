# AlzAI feature-prediction ML service

This FastAPI service performs feature-based inference with the provided PyTorch model. It does not accept image uploads and does not provide MRI prediction.

## Model files

Copy these existing files into `backend/models/` without renaming them:

- `model_param.pth`
- `Scaler.pkl`

The model is a binary PyTorch ANN. Its checkpoint tensor shapes define a `32 → 8 → 8 → 6 → 6 → 4 → 1` network with a final sigmoid output. The supplied scaler accepts the 32 dataset fields in the order declared in `app/ml/feature_definition.py`. The output is converted from a 0–1 sigmoid score into a 0–100 percentage. A class of `1` means the model score is at least 0.5; it is a model result, not a diagnosis.

`PatientID` and `DoctorInCharge` are metadata. `Diagnosis` is the dataset target, so the API rejects it as input. SMOTE is not part of inference and is never applied to an individual request.

## Setup

From this `backend` folder, use PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Note: model_param.pth and Scaler.pkl are already present in .\models\
uvicorn app.main:app --reload --port 8000
```

Set `FRONTEND_URL` in `.env` to the React app origin, normally `http://localhost:5173`. API documentation is available at `http://127.0.0.1:8000/docs`.

## Endpoints

- `GET /api/health`
- `POST /api/prediction/predict`

The POST body must contain the exact 32 model fields. A successful response has this shape:

```json
{
  "success": true,
  "data": {
    "probability": 72.45,
    "prediction": 1,
    "status": "success"
  }
}
```

## Tests

After copying the two artifacts and installing requirements:

```powershell
pytest
```

The tests load the supplied checkpoint and scaler. They do not use a fake model or a hardcoded prediction output.
