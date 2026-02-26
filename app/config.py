from functools import lru_cache
from typing import List

import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    def __init__(self) -> None:
        # Database
        self.database_url: str = os.getenv(
            "DATABASE_URL", "sqlite:///./hrms.db"
        )

        # Auth / JWT
        self.secret_key: str = os.getenv("SECRET_KEY", "change_me")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )
        self.refresh_token_expire_minutes: int = int(
            os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080")
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

