from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hosted_zone_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    ttl: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    routing_policy: Mapped[str] = mapped_column(String(50), default="Simple", nullable=False)
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
    hosted_zone: Mapped["HostedZone"] = relationship(  # type: ignore[name-defined]
        "HostedZone",
        back_populates="records",
    )
