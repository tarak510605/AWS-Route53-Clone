def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_wrong_email(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@example.com"


def test_get_me_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 403


def test_logout(client, auth_headers):
    response = client.post("/api/auth/logout", headers=auth_headers)
    assert response.status_code == 200
