from fastapi.testclient import TestClient

from app.main import app


VALID_PAYLOAD = {
    "Age": 73, "Gender": 0, "Ethnicity": 0, "EducationLevel": 2,
    "BMI": 22.927749230993864, "Smoking": 0, "AlcoholConsumption": 13.29721772827684,
    "PhysicalActivity": 6.327112473553353, "DietQuality": 1.3472143059081076,
    "SleepQuality": 9.025678665766115, "FamilyHistoryAlzheimers": 0,
    "CardiovascularDisease": 0, "Diabetes": 1, "Depression": 1, "HeadInjury": 0,
    "Hypertension": 0, "SystolicBP": 142, "DiastolicBP": 72,
    "CholesterolTotal": 242.36683969636556, "CholesterolLDL": 56.15089696091113,
    "CholesterolHDL": 33.68256349839592, "CholesterolTriglycerides": 162.18914307736603,
    "MMSE": 21.46353236431666, "FunctionalAssessment": 6.518876973217633,
    "MemoryComplaints": 0, "BehavioralProblems": 0, "ADL": 1.7258834599441897,
    "Confusion": 0, "Disorientation": 0, "PersonalityChanges": 0,
    "DifficultyCompletingTasks": 1, "Forgetfulness": 0,
}


def test_supplied_model_and_scaler_load() -> None:
    with TestClient(app) as client:
        health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["model"] == "loaded"


def test_valid_prediction_uses_supplied_model() -> None:
    with TestClient(app) as client:
        response = client.post("/api/prediction/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "success"
    assert body["data"]["prediction"] in {0, 1}
    assert 0 <= body["data"]["probability"] <= 100


def test_missing_feature_is_rejected() -> None:
    payload = VALID_PAYLOAD.copy()
    payload.pop("MMSE")
    with TestClient(app) as client:
        response = client.post("/api/prediction/predict", json=payload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_invalid_type_is_rejected() -> None:
    with TestClient(app) as client:
        response = client.post("/api/prediction/predict", json=VALID_PAYLOAD | {"Age": "seventy-three"})
    assert response.status_code == 422


def test_invalid_categorical_value_is_rejected() -> None:
    with TestClient(app) as client:
        response = client.post("/api/prediction/predict", json=VALID_PAYLOAD | {"Gender": 2})
    assert response.status_code == 422


def test_diagnosis_is_not_accepted_as_an_input() -> None:
    with TestClient(app) as client:
        response = client.post("/api/prediction/predict", json=VALID_PAYLOAD | {"Diagnosis": 1})
    assert response.status_code == 422
