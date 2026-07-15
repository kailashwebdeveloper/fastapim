from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_signup_endpoint_returns_error_for_missing_password():
    response = client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "alice@example.com"},
    )
    assert response.status_code == 400
    assert "Password is required" in response.text


def test_login_endpoint_returns_validation_error_without_password():
    response = client.post(
        "/auth/login",
        json={"email": "alice@example.com"},
    )
    assert response.status_code == 400
    assert "Password is required" in response.text


@patch("main.get_connection")
def test_signup_with_mocked_db(mock_get_connection):
    class FakeCursor:
        def __init__(self):
            self._rows = []
            self._fetch_calls = 0

        def execute(self, *args, **kwargs):
            return None

        def fetchone(self):
            self._fetch_calls += 1
            if self._fetch_calls == 1:
                return None
            return [1]

        def fetchall(self):
            return []

        def close(self):
            return None

    class FakeConn:
        def cursor(self):
            return FakeCursor()

        def commit(self):
            return None

        def rollback(self):
            return None

        def close(self):
            return None

    mock_get_connection.return_value = FakeConn()

    response = client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret"},
    )
    assert response.status_code == 200
