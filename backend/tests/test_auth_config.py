import unittest

from app.core.auth import (
    DEVELOPMENT_JWT_SECRET,
    validate_jwt_configuration,
)


class JwtConfigurationTests(unittest.TestCase):
    def test_production_requires_a_secret(self):
        with self.assertRaisesRegex(
            RuntimeError, "JWT_SECRET must be set when APP_ENV=production"
        ):
            validate_jwt_configuration("production", None)

    def test_production_rejects_the_development_secret(self):
        with self.assertRaisesRegex(
            RuntimeError, "must not use the development secret"
        ):
            validate_jwt_configuration("production", DEVELOPMENT_JWT_SECRET)

    def test_development_uses_the_explicit_fallback(self):
        self.assertEqual(
            DEVELOPMENT_JWT_SECRET,
            validate_jwt_configuration("development", None),
        )


if __name__ == "__main__":
    unittest.main()
