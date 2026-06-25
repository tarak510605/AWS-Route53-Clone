from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.dns_record import DNSRecord
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate


class DNSRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, record_id: int) -> Optional[DNSRecord]:
        return self.db.query(DNSRecord).filter(DNSRecord.id == record_id).first()

    def list_by_zone(
        self,
        hosted_zone_id: int,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        filter_type: Optional[str] = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> Tuple[List[DNSRecord], int]:
        query = self.db.query(DNSRecord).filter(
            DNSRecord.hosted_zone_id == hosted_zone_id
        )

        if search:
            query = query.filter(
                or_(
                    DNSRecord.name.ilike(f"%{search}%"),
                    DNSRecord.value.ilike(f"%{search}%"),
                    DNSRecord.type.ilike(f"%{search}%"),
                )
            )

        if filter_type:
            query = query.filter(DNSRecord.type == filter_type.upper())

        total = query.count()

        sort_column = getattr(DNSRecord, sort_by, DNSRecord.name)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total

    def create(self, hosted_zone_id: int, data: DNSRecordCreate) -> DNSRecord:
        record = DNSRecord(
            hosted_zone_id=hosted_zone_id,
            name=data.name,
            type=data.type,
            value=data.value,
            ttl=data.ttl,
            routing_policy=data.routing_policy,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update(self, record: DNSRecord, data: DNSRecordUpdate) -> DNSRecord:
        if data.name is not None:
            record.name = data.name
        if data.type is not None:
            record.type = data.type
        if data.value is not None:
            record.value = data.value
        if data.ttl is not None:
            record.ttl = data.ttl
        if data.routing_policy is not None:
            record.routing_policy = data.routing_policy
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete(self, record: DNSRecord) -> None:
        self.db.delete(record)
        self.db.commit()

    def bulk_delete(self, record_ids: List[int], hosted_zone_id: int) -> int:
        deleted = (
            self.db.query(DNSRecord)
            .filter(
                DNSRecord.id.in_(record_ids),
                DNSRecord.hosted_zone_id == hosted_zone_id,
            )
            .delete(synchronize_session=False)
        )
        self.db.commit()
        return deleted
