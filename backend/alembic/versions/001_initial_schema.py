"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "hosted_zones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("zone_name", sa.String(length=255), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("private_zone", sa.Boolean(), nullable=False),
        sa.Column("record_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hosted_zones_id", "hosted_zones", ["id"], unique=False)
    op.create_index("ix_hosted_zones_zone_name", "hosted_zones", ["zone_name"], unique=True)

    op.create_table(
        "dns_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hosted_zone_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("ttl", sa.Integer(), nullable=False),
        sa.Column("routing_policy", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["hosted_zone_id"], ["hosted_zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dns_records_id", "dns_records", ["id"], unique=False)
    op.create_index("ix_dns_records_hosted_zone_id", "dns_records", ["hosted_zone_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_dns_records_hosted_zone_id", table_name="dns_records")
    op.drop_index("ix_dns_records_id", table_name="dns_records")
    op.drop_table("dns_records")
    op.drop_index("ix_hosted_zones_zone_name", table_name="hosted_zones")
    op.drop_index("ix_hosted_zones_id", table_name="hosted_zones")
    op.drop_table("hosted_zones")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
