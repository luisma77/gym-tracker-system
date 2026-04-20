from fastapi.testclient import TestClient


def test_register_and_login_flow(client: TestClient) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "Super-secure-pass1!"
        }
    )

    assert register_response.status_code == 201
    assert register_response.json()["email"] == "test@example.com"

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Super-secure-pass1!"
        }
    )

    assert login_response.status_code == 200
    assert login_response.json()["token_type"] == "bearer"
    assert login_response.json()["user"]["full_name"] == "Test User"
