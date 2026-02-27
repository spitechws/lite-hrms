from functools import lru_cache
from typing import List

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


def _get_int_env(name: str, default: int) -> int:
    """
    Read integer env values safely.
    Treat missing/blank values as default to avoid startup crashes.
    """
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        return default


class Settings:
    def __init__(self) -> None:
        # Database
        self.database_url: str = os.getenv(
            "DATABASE_URL",
            # Example MySQL DSN; override in .env with real credentials/db.
            "mysql+pymysql://root:password@localhost/hrms_lite",
        )

        # Auth / JWT
        self.secret_key: str = os.getenv("SECRET_KEY", "change_me")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = _get_int_env(
            "ACCESS_TOKEN_EXPIRE_MINUTES", 30
        )
        self.refresh_token_expire_minutes: int = _get_int_env(
            "REFRESH_TOKEN_EXPIRE_MINUTES", 10080
        )  # 7 days

        # CORS
        raw_origins = os.getenv("CORS_ORIGINS", "*")
        if raw_origins.strip() == "*":
            self.cors_origins: List[str] = ["*"]
        else:
            self.cors_origins = [
                origin.strip()
                for origin in raw_origins.split(",")
                if origin.strip()
            ]


@lru_cache
def get_settings() -> Settings:
    return Settings()

