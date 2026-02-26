"""add departments table

Revision ID: c2d3e4f5a6b7
Revises: b1a2c3d4e5f6
Create Date: 2026-02-26 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c2d3e4f5a6b7"
down_revision: Union[str, None] = "b1a2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  bind = op.get_bind()
  inspector = sa.inspect(bind)
  existing_tables = inspector.get_table_names()
  if "departments" in existing_tables:
      # Table already exists (likely created via Base.metadata.create_all);
      # treat this migration as applied.
      return

  op.create_table(
      "departments",
      sa.Column("id", sa.Integer(), nullable=False),
      # Bounded length for MySQL indexed/unique column
      sa.Column("name", sa.String(length=191), nullable=False),
      sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index(op.f("ix_departments_id"), "departments", ["id"], unique=False)
  op.create_index(op.f("ix_departments_name"), "departments", ["name"], unique=True)


def downgrade() -> None:
  op.drop_index(op.f("ix_departments_name"), table_name="departments")
  op.drop_index(op.f("ix_departments_id"), table_name="departments")
  op.drop_table("departments")

