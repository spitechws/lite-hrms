from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.models import Base

settings = get_settings()

# MySQL connection via DATABASE_URL (e.g. mysql+pymysql://user:pass@host/db)
# Use a resilient connection pool suitable for production.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=1800,  # recycle connections periodically to avoid stale connections
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

