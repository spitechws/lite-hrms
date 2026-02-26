from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Auth, User
from app.service.auth_service import AuthServiceFactory


def seed_initial_admin(
    username: str = "admin",
    email: str = "admin@example.com",
    password: str = "admin123",
) -> None:
    """
    Create the very first admin user (and its auth credentials) if it does not exist.
    Safe to run multiple times – it will no-op if the username already exists.
    """
    db: Session = SessionLocal()
    try:
        # Check if a user with this username already exists
        existing_user = (
            db.query(User).filter(User.username == username).one_or_none()
        )
        if existing_user:
            return

        # Create the user row
        user = User(
            username=username,
            email=email,
            full_name="Administrator",
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create the auth credentials row linked to the user
        auth_service = AuthServiceFactory.create()
        password_hash = auth_service.get_password_hash(password)

        auth = Auth(
            username=username,
            password_hash=password_hash,
            table_name=User.__tablename__,
            table_id=user.id,
        )
        db.add(auth)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_initial_admin()
