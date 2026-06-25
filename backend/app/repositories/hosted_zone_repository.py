from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate


class HostedZoneRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, zone_id: int) -> Optional[HostedZone]:
        return self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()

    def get_by_name(self, zone_name: str) -> Optional[HostedZone]:
        return self.db.query(HostedZone).filter(HostedZone.zone_name == zone_name).first()

    def list(
        self,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        filter_type: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[HostedZone], int]:
        query = self.db.query(HostedZone)

        if search:
            query = query.filter(
                or_(
                    HostedZone.zone_name.ilike(f"%{search}%"),
                    HostedZone.comment.ilike(f"%{search}%"),
                )
            )

        if filter_type == "private":
            query = query.filter(HostedZone.private_zone == True)  # noqa: E712
        elif filter_type == "public":
            query = query.filter(HostedZone.private_zone == False)  # noqa: E712

        total = query.count()

        sort_column = getattr(HostedZone, sort_by, HostedZone.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total

    def create(self, data: HostedZoneCreate) -> HostedZone:
        zone = HostedZone(
            zone_name=data.zone_name,
            comment=data.comment or "",
            private_zone=data.private_zone,
            record_count=0,
        )
        self.db.add(zone)
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def update(self, zone: HostedZone, data: HostedZoneUpdate) -> HostedZone:
        if data.comment is not None:
            zone.comment = data.comment
        if data.private_zone is not None:
            zone.private_zone = data.private_zone
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def delete(self, zone: HostedZone) -> None:
        self.db.delete(zone)
        self.db.commit()

    def update_record_count(self, zone_id: int) -> None:
        from app.models.dns_record import DNSRecord

        count = (
            self.db.query(func.count(DNSRecord.id))
            .filter(DNSRecord.hosted_zone_id == zone_id)
            .scalar()
        )
        self.db.query(HostedZone).filter(HostedZone.id == zone_id).update(
            {"record_count": count}
        )
        self.db.commit()
