import importlib
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def load_main(frontend_url=None):
    env = {
        "DATABASE_URL": "sqlite:///./test.db",
        "FRONTEND_URL": frontend_url or "",
    }

    with patch.dict(os.environ, env, clear=False):
        sys.modules.pop("app.main", None)
        return importlib.import_module("app.main")


class CorsTests(unittest.TestCase):
    def test_configured_origin_receives_credentialed_preflight_headers(self):
        main = load_main(" https://admin.kewinchem.com, ,https://portal.kewinchem.com ")
        client = TestClient(main.app)

        response = client.options(
            "/api/v1/products/",
            headers={
                "Origin": "https://admin.kewinchem.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "https://admin.kewinchem.com")
        self.assertEqual(response.headers["access-control-allow-credentials"], "true")
        self.assertIn("GET", response.headers["access-control-allow-methods"])
        self.assertIn("Authorization", response.headers["access-control-allow-headers"])

    def test_unapproved_vercel_preview_receives_no_cors_permission(self):
        main = load_main()
        client = TestClient(main.app)

        response = client.options(
            "/api/v1/products/",
            headers={
                "Origin": "https://unapproved-preview.vercel.app",
                "Access-Control-Request-Method": "GET",
            },
        )

        self.assertNotIn("access-control-allow-origin", response.headers)

    def test_frontend_url_whitespace_and_empty_entries_are_ignored(self):
        main = load_main(" https://admin.kewinchem.com, ,  ,https://portal.kewinchem.com ")

        self.assertIn("https://admin.kewinchem.com", main.origins)
        self.assertIn("https://portal.kewinchem.com", main.origins)
        self.assertNotIn("", main.origins)
        self.assertNotIn(" ", main.origins)

    def test_canonical_origin_receives_credentialed_preflight_headers(self):
        main = load_main()
        client = TestClient(main.app)

        response = client.options(
            "/api/v1/products/",
            headers={
                "Origin": "https://www.kewinchem.com",
                "Access-Control-Request-Method": "GET",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "https://www.kewinchem.com")
        self.assertEqual(response.headers["access-control-allow-credentials"], "true")


if __name__ == "__main__":
    unittest.main()
