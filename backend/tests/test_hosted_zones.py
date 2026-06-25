def test_create_hosted_zone(client, auth_headers):
    response = client.post(
        "/api/hosted-zones",
        json={"zone_name": "example.com", "comment": "Test zone", "private_zone": False},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["zone_name"] == "example.com."
    assert data["comment"] == "Test zone"
    assert data["private_zone"] is False
    assert data["record_count"] == 0


def test_create_hosted_zone_duplicate(client, auth_headers):
    client.post(
        "/api/hosted-zones",
        json={"zone_name": "example.com"},
        headers=auth_headers,
    )
    response = client.post(
        "/api/hosted-zones",
        json={"zone_name": "example.com"},
        headers=auth_headers,
    )
    assert response.status_code == 409


def test_list_hosted_zones(client, auth_headers):
    for name in ["alpha.com", "beta.com", "gamma.com"]:
        client.post("/api/hosted-zones", json={"zone_name": name}, headers=auth_headers)

    response = client.get("/api/hosted-zones", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3


def test_get_hosted_zone(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        json={"zone_name": "getme.com"},
        headers=auth_headers,
    )
    zone_id = create_resp.json()["id"]

    response = client.get(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == zone_id


def test_get_hosted_zone_not_found(client, auth_headers):
    response = client.get("/api/hosted-zones/99999", headers=auth_headers)
    assert response.status_code == 404


def test_update_hosted_zone(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        json={"zone_name": "update.com", "comment": "old"},
        headers=auth_headers,
    )
    zone_id = create_resp.json()["id"]

    response = client.put(
        f"/api/hosted-zones/{zone_id}",
        json={"comment": "new comment"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["comment"] == "new comment"


def test_delete_hosted_zone(client, auth_headers):
    create_resp = client.post(
        "/api/hosted-zones",
        json={"zone_name": "delete.com"},
        headers=auth_headers,
    )
    zone_id = create_resp.json()["id"]

    response = client.delete(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_search_hosted_zones(client, auth_headers):
    client.post("/api/hosted-zones", json={"zone_name": "searchable.com", "comment": "find me"}, headers=auth_headers)
    client.post("/api/hosted-zones", json={"zone_name": "other.net"}, headers=auth_headers)

    response = client.get("/api/hosted-zones?search=searchable", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1
