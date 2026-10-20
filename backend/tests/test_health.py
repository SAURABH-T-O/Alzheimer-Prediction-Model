from fastapi.testclient import TestClient

from app.main import app


def test_health_reports_service_and_model_state() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["status"] == "healthy"
    assert response.json()["model"] in {"loaded", "unavailable"}
