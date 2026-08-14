from app.db.models import Inquiry, SampleRequest


def test_invalid_sample_payloads_return_422_and_do_not_write(client, db_session, sample_request_payload):
    invalid_payloads = [
        {k: v for k, v in sample_request_payload.items() if k != "name"},
        {**sample_request_payload, "name": "A"},
        {**sample_request_payload, "company": "B"},
        {**sample_request_payload, "email": "not-an-email"},
        {**sample_request_payload, "category_slug": ""},
        {**sample_request_payload, "subcategory_slug": ""},
    ]

    for payload in invalid_payloads:
        before = db_session.query(SampleRequest).count()
        response = client.post("/api/v1/sample-requests/", json=payload)
        assert response.status_code == 422
        assert db_session.query(SampleRequest).count() == before


def test_valid_sample_payload_persists_and_keeps_response_contract(client, db_session, sample_request_payload):
    response = client.post("/api/v1/sample-requests/", json=sample_request_payload)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert isinstance(body["id"], int)

    record = db_session.query(SampleRequest).one()
    assert record.id == body["id"]
    assert record.email == sample_request_payload["email"]
    assert record.product_name == sample_request_payload["product_name"]
    assert record.attributes == sample_request_payload["attributes"]


def test_sample_email_failure_is_isolated(client, db_session, sample_request_payload, monkeypatch):
    from app.api.v1.endpoints import sample_requests

    def fail_send(_req):
        raise RuntimeError("email vendor down")

    monkeypatch.setattr(sample_requests, "_send_sample_email", fail_send)

    response = client.post("/api/v1/sample-requests/", json=sample_request_payload)

    assert response.status_code == 200
    assert db_session.query(SampleRequest).count() == 1


def test_invalid_inquiry_payloads_return_422_and_do_not_write(client, db_session, inquiry_payload):
    invalid_payloads = [
        {**inquiry_payload, "email": "invalid"},
        {**inquiry_payload, "subject": "S"},
        {**inquiry_payload, "message": "too short"},
    ]

    for payload in invalid_payloads:
        before = db_session.query(Inquiry).count()
        response = client.post("/api/v1/inquiries/", json=payload)
        assert response.status_code == 422
        assert db_session.query(Inquiry).count() == before


def test_valid_inquiry_payload_persists_and_keeps_response_contract(client, db_session, inquiry_payload):
    response = client.post("/api/v1/inquiries/", json=inquiry_payload)

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Inquiry submitted successfully"}

    record = db_session.query(Inquiry).one()
    assert record.name == inquiry_payload["name"]
    assert record.email == inquiry_payload["email"]
    assert record.subject == inquiry_payload["subject"]
    assert record.message == inquiry_payload["message"]
    assert record.status == "pending"


def test_inquiry_email_failure_is_isolated(client, db_session, inquiry_payload, monkeypatch):
    from app.api.v1.endpoints import inquiries

    def fail_send(_req):
        raise RuntimeError("email vendor down")

    monkeypatch.setattr(inquiries, "_send_inquiry_email", fail_send)

    response = client.post("/api/v1/inquiries/", json=inquiry_payload)

    assert response.status_code == 200
    assert db_session.query(Inquiry).count() == 1
