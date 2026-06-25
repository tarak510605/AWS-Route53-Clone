from datetime import datetime, timezone
from typing import List

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=True, default="")
    private_zone: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    record_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Use string forward reference — avoids circular import at runtime
    records: Mapped[List["DNSRecord"]] = relationship(  # type: ignore[name-defined]
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
    )
