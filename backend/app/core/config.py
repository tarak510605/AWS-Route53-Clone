from __future__ import annotations

from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Route53 Clone API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite:///./route53.db"

    SECRET_KEY: str = "super-secret-key-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # Demo credentials (mocked auth)
    DEMO_EMAIL: str = "admin@example.com"
    DEMO_PASSWORD: str = "password123"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
