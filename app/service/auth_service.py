from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app import crud, models
from app.config import get_settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class AuthService:
    def __init__(
        self,
        secret_key: str,
        algorithm: str,
        access_token_expire_minutes: int,
        refresh_token_expire_minutes: int,
    ) -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_minutes = refresh_token_expire_minutes

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def authenticate_user(self, db: Session, username: str, password: str):
        """
        Authenticate against the Auth table and return the linked User.

        - First, try to find an Auth row by username.
        - If not found, treat the provided value as an email, look up the User,
          then find the corresponding Auth row.
        """
        # 1) Look up Auth by username directly.
        auth = db.query(models.Auth).filter(models.Auth.username == username).first()

        # 2) If not found, treat the input as an email and resolve via User.
        if not auth:
            user_by_email = crud.get_user_by_email(db, username)
            if not user_by_email:
                return None

            auth = (
                db.query(models.Auth)
                .filter(
                    models.Auth.table_name == models.User.__tablename__,
                    models.Auth.table_id == user_by_email.id,
                )
                .first()
            )
            if not auth:
                return None

        # Verify password against the stored hash.
        if not self.verify_password(password, auth.password_hash):
            return None

        # Resolve the linked user row; for now we only support users.
        if auth.table_name != models.User.__tablename__:
            return None

        user = (
            db.query(models.User)
            .filter(models.User.id == auth.table_id)
            .first()
        )
        return user

    def create_access_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta
            if expires_delta is not None
            else timedelta(minutes=self.access_token_expire_minutes)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta
            if expires_delta is not None
            else timedelta(minutes=self.refresh_token_expire_minutes)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)


class AuthServiceFactory:
    @staticmethod
    def create() -> "AuthService":
        settings = get_settings()
        return AuthService(
            settings.secret_key,
            settings.jwt_algorithm,
            settings.access_token_expire_minutes,
            settings.refresh_token_expire_minutes,
        )

