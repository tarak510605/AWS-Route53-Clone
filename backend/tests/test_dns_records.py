import pytest


@pytest.fixture
def zone_id(client, auth_headers):
    resp = client.post(
        "/api/hosted-zones",
        json={"zone_name": "records-test.com"},
        headers=auth_headers,
    )
    return resp.json()["id"]


def test_create_dns_record(client, auth_headers, zone_id):
    response = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "www", "type": "A", "value": "1.2.3.4", "ttl": 300, "routing_policy": "Simple"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "www"
    assert data["type"] == "A"


def test_create_record_invalid_type(client, auth_headers, zone_id):
    response = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "www", "type": "INVALID", "value": "1.2.3.4", "ttl": 300},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_create_record_negative_ttl(client, auth_headers, zone_id):
    response = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "www", "type": "A", "value": "1.2.3.4", "ttl": -1},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_list_dns_records(client, auth_headers, zone_id):
    for i in range(3):
        client.post(
            f"/api/hosted-zones/{zone_id}/records",
            json={"name": f"host{i}", "type": "A", "value": f"1.2.3.{i}", "ttl": 300},
            headers=auth_headers,
        )

    response = client.get(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 3


def test_update_dns_record(client, auth_headers, zone_id):
    create_resp = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "mail", "type": "MX", "value": "10 mail.example.com.", "ttl": 3600},
        headers=auth_headers,
    )
    record_id = create_resp.json()["id"]

    response = client.put(
        f"/api/records/{record_id}",
        json={"ttl": 7200},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["ttl"] == 7200


def test_delete_dns_record(client, auth_headers, zone_id):
    create_resp = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "del", "type": "CNAME", "value": "target.com.", "ttl": 300},
        headers=auth_headers,
    )
    record_id = create_resp.json()["id"]

    response = client.delete(f"/api/records/{record_id}", headers=auth_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/api/records/{record_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_bulk_delete_records(client, auth_headers, zone_id):
    ids = []
    for i in range(3):
        resp = client.post(
            f"/api/hosted-zones/{zone_id}/records",
            json={"name": f"bulk{i}", "type": "A", "value": f"10.0.0.{i}", "ttl": 60},
            headers=auth_headers,
        )
        ids.append(resp.json()["id"])

    response = client.delete(
        f"/api/hosted-zones/{zone_id}/records/bulk",
        json={"ids": ids[:2]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["deleted"] == 2

    list_resp = client.get(f"/api/hosted-zones/{zone_id}/records", headers=auth_headers)
    assert list_resp.json()["total"] == 1


def test_record_count_updates(client, auth_headers, zone_id):
    client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "count", "type": "A", "value": "5.5.5.5", "ttl": 60},
        headers=auth_headers,
    )
    zone_resp = client.get(f"/api/hosted-zones/{zone_id}", headers=auth_headers)
    assert zone_resp.json()["record_count"] == 1
