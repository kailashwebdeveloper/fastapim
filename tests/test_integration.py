from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_or_root_not_found():
    response = client.get("/")
    assert response.status_code == 404
