"""
One-shot installer script for HRMS Lite backend.

- Applies all database migrations (Alembic -> head)
- Runs all seeders (currently: initial admin user)

Safe to run multiple times; migrations are idempotent and seeders
use existence checks.
"""

from pathlib import Path

from alembic import command
from alembic.config import Config

from app.database.seeder import seed_initial_admin


def run_migrations() -> None:
    project_root = Path(__file__).resolve().parents[1]
    alembic_ini = project_root / "alembic.ini"

    cfg = Config(str(alembic_ini))
    cfg.set_main_option("script_location", "alembic")

    command.upgrade(cfg, "head")


def run_seeders() -> None:
    seed_initial_admin()


def main() -> None:
    run_migrations()
    run_seeders()


if __name__ == "__main__":
    main()

