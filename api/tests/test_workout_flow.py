from fastapi.testclient import TestClient


def test_create_session_and_load_dashboard(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "athlete@example.com",
            "full_name": "Athlete",
            "password": "Super-secure-pass1!"
        }
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "athlete@example.com",
            "password": "Super-secure-pass1!"
        }
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    exercises_response = client.get("/api/v1/exercises")
    exercises = exercises_response.json()
    assert len(exercises) >= 20

    create_response = client.post(
        "/api/v1/sessions",
        headers=headers,
        json={
            "title": "Pierna pesada",
            "training_day": "Lunes",
            "week_number": 3,
            "notes": "Buen entrenamiento",
            "sets": [
                {
                    "exercise_id": exercises[0]["id"],
                    "reps": 8,
                    "rir": 2,
                    "weight_kg": 100
                },
                {
                    "exercise_id": exercises[1]["id"],
                    "reps": 10,
                    "rir": 1,
                    "weight_kg": 80
                }
            ]
        }
    )

    assert create_response.status_code == 201
    assert len(create_response.json()["sets"]) == 2

    dashboard_response = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["total_sessions"] == 1
    assert dashboard_response.json()["total_sets"] == 2


def test_create_and_list_body_measurements(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "measurements@example.com",
            "full_name": "Body Tracker",
            "password": "Super-secure-pass1!"
        }
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "measurements@example.com",
            "password": "Super-secure-pass1!"
        }
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_response = client.post(
        "/api/v1/measurements",
        headers=headers,
        json={
            "weight_kg": 82.4,
            "waist_cm": 84,
            "chest_cm": 106,
            "arm_cm": 38.5,
            "notes": "Inicio del bloque"
        }
    )

    assert create_response.status_code == 200
    assert create_response.json()["weight_kg"] == 82.4

    list_response = client.get("/api/v1/measurements", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["waist_cm"] == 84
