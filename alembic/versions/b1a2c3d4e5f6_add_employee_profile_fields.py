"""add employee profile fields

Revision ID: b1a2c3d4e5f6
Revises: ac49c0a24d5c
Create Date: 2026-02-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1a2c3d4e5f6"
down_revision: Union[str, None] = "ac49c0a24d5c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add structured employee profile fields to the unified users table.
    op.add_column(
        "users",
        sa.Column("first_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("last_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("gender", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("address", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("pin", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("city", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    # Drop the structured profile fields if rolling back.
    op.drop_column("users", "city")
    op.drop_column("users", "pin")
    op.drop_column("users", "address")
    op.drop_column("users", "gender")
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")

