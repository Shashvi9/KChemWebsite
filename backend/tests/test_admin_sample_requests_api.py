from datetime import datetime


def _seed_queue(seed_sample_request):
    alpha = seed_sample_request(
        name="Alice Alpha",
        company="Acme Research",
        email="alice@example.com",
        phone="+1 555 0101",
        country="United States",
        status="pending",
        category_slug="pharma",
        subcategory_slug="api",
        product_id=111,
        product_name="Vitamin C",
        quantity="500 g",
        created_at=datetime(2026, 8, 1, 9, 0, 0),
    )
    beta = seed_sample_request(
        name="Bina Beta",
        company="Beta Foods",
        email="bina@example.com",
        phone="+91 555 0102",
        country="India",
        status="approved",
        category_slug="food",
        subcategory_slug="colors",
        product_id=222,
        product_name="Sunset Yellow",
        quantity="2 kg",
        created_at=datetime(2026, 8, 2, 9, 0, 0),
    )
    gamma = seed_sample_request(
        name="Carlos Gamma",
        company="Gamma Pharma",
        email="carlos@example.com",
        phone="+55 555 0103",
        country="Brazil",
        status="pending",
        category_slug="pharma",
        subcategory_slug="excipients",
        product_id=333,
        product_name="Lactose",
        quantity="10 kg",
        created_at=datetime(2026, 8, 2, 9, 0, 0),
    )
    delta = seed_sample_request(
        name="Dana Delta",
        company="Delta Labs",
        email="dana@example.com",
        phone="+44 555 0104",
        country="United Kingdom",
        status="rejected",
        category_slug="lab",
        subcategory_slug="reagents",
        product_id=444,
        product_name="Acetone",
        quantity="1 L",
        created_at=datetime(2026, 8, 3, 9, 0, 0),
    )
    echo = seed_sample_request(
        name="Evan Echo",
        company="Echo Nutrition",
        email="evan@example.com",
        phone="+1 555 0105",
        country="Canada",
        status="approved",
        category_slug="food",
        subcategory_slug="vitamins",
        product_id=555,
        product_name="Vitamin D",
        quantity="25 kg",
        created_at=datetime(2026, 8, 4, 9, 0, 0),
    )
    return alpha, beta, gamma, delta, echo


def _ids(response):
    return [item["id"] for item in response.json()["items"]]


def test_valid_admin_can_list_queue(client, admin_headers, seed_sample_request):
    records = _seed_queue(seed_sample_request)

    response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "total", "page", "page_size"}
    assert body["total"] == len(records)
    assert body["page"] == 1
    assert body["page_size"] == 20


def test_search_matches_supported_queue_fields(client, admin_headers, seed_sample_request):
    alpha, beta, gamma, delta, echo = _seed_queue(seed_sample_request)

    cases = [
        ("alice", [alpha.id]),
        ("Beta Foods", [beta.id]),
        ("carlos@example.com", [gamma.id]),
        ("Acetone", [delta.id]),
        ("0105", [echo.id]),
        ("Brazil", [gamma.id]),
        ("food", [echo.id, beta.id]),
        ("excipients", [gamma.id]),
        ("25 kg", [echo.id]),
        ("444", [delta.id]),
    ]

    for query, expected_ids in cases:
        response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers, params={"q": query})
        assert response.status_code == 200
        assert response.json()["total"] == len(expected_ids)
        assert _ids(response) == expected_ids


def test_whitespace_search_behaves_like_no_search(client, admin_headers, seed_sample_request):
    records = _seed_queue(seed_sample_request)

    response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers, params={"q": "   "})

    assert response.status_code == 200
    assert response.json()["total"] == len(records)


def test_status_filter_returns_exact_status(client, admin_headers, seed_sample_request):
    alpha, _beta, gamma, _delta, _echo = _seed_queue(seed_sample_request)

    response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers, params={"status": "pending"})

    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert _ids(response) == [gamma.id, alpha.id]


def test_date_filters_are_inclusive(client, admin_headers, seed_sample_request):
    _alpha, beta, gamma, delta, _echo = _seed_queue(seed_sample_request)

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"date_from": "2026-08-02", "date_to": "2026-08-03", "sort": "created_at"},
    )

    assert response.status_code == 200
    assert response.json()["total"] == 3
    assert _ids(response) == [beta.id, gamma.id, delta.id]


def test_combined_filters_return_stable_totals_and_items(client, admin_headers, seed_sample_request):
    _alpha, beta, _gamma, _delta, echo = _seed_queue(seed_sample_request)

    response = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"q": "food", "status": "approved", "date_from": "2026-08-01", "date_to": "2026-08-04"},
    )

    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert _ids(response) == [echo.id, beta.id]


def test_sorting_and_tie_breakers_are_deterministic(client, admin_headers, seed_sample_request):
    alpha, beta, gamma, delta, echo = _seed_queue(seed_sample_request)

    desc_created = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"sort": "-created_at"},
    )
    assert _ids(desc_created) == [echo.id, delta.id, gamma.id, beta.id, alpha.id]

    asc_created = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"sort": "created_at"},
    )
    assert _ids(asc_created) == [alpha.id, beta.id, gamma.id, delta.id, echo.id]

    asc_status = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"sort": "status"},
    )
    assert _ids(asc_status) == [beta.id, echo.id, alpha.id, gamma.id, delta.id]

    desc_status = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"sort": "-status"},
    )
    assert _ids(desc_status) == [delta.id, gamma.id, alpha.id, echo.id, beta.id]


def test_pagination_boundaries(client, admin_headers, seed_sample_request):
    records = _seed_queue(seed_sample_request)

    page_one = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"page": 1, "page_size": 2, "sort": "created_at"},
    )
    middle_page = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"page": 2, "page_size": 2, "sort": "created_at"},
    )
    beyond = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"page": 99, "page_size": 2, "sort": "created_at"},
    )
    one = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"page_size": 1},
    )
    max_page_size = client.get(
        "/api/v1/admin/sample-requests/",
        headers=admin_headers,
        params={"page_size": 200},
    )

    assert page_one.status_code == 200
    assert page_one.json()["total"] == len(records)
    assert len(page_one.json()["items"]) == 2
    assert len(middle_page.json()["items"]) == 2
    assert beyond.json()["items"] == []
    assert one.json()["page_size"] == 1
    assert len(one.json()["items"]) == 1
    assert max_page_size.json()["page_size"] == 200
    assert len(max_page_size.json()["items"]) == len(records)


def test_invalid_pagination_date_and_sort_return_422(client, admin_headers):
    cases = [
        {"page": 0},
        {"page_size": 0},
        {"page_size": 201},
        {"date_from": "08-01-2026"},
        {"date_to": "tomorrow"},
        {"sort": "not_a_column"},
    ]

    for params in cases:
        response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers, params=params)
        assert response.status_code == 422


def test_empty_result_search_returns_empty_items(client, admin_headers, seed_sample_request):
    _seed_queue(seed_sample_request)

    response = client.get("/api/v1/admin/sample-requests/", headers=admin_headers, params={"q": "no matches"})

    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["items"] == []


def test_export_uses_same_filters_and_sort_order(client, admin_headers, seed_sample_request):
    _alpha, beta, _gamma, _delta, echo = _seed_queue(seed_sample_request)

    response = client.post(
        "/api/v1/admin/sample-requests/export",
        headers=admin_headers,
        params={"q": "food", "status": "approved", "sort": "created_at"},
    )

    assert response.status_code == 200
    csv_body = response.text
    beta_index = csv_body.index(str(beta.id))
    echo_index = csv_body.index(str(echo.id))
    assert beta_index < echo_index
    assert "Sunset Yellow" in csv_body
    assert "Vitamin D" in csv_body


def test_export_supports_frontend_get_route(client, admin_headers, seed_sample_request):
    _alpha, beta, _gamma, _delta, echo = _seed_queue(seed_sample_request)

    response = client.get(
        "/api/v1/admin/sample-requests/export",
        headers=admin_headers,
        params={"q": "food", "status": "approved", "sort": "created_at"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    csv_body = response.text
    beta_index = csv_body.index(str(beta.id))
    echo_index = csv_body.index(str(echo.id))
    assert beta_index < echo_index
