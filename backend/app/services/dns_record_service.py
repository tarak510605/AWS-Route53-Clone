from __future__ import annotations

import math
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.dns_record_repository import DNSRecordRepository
from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordListResponse,
    DNSRecordResponse,
    DNSRecordUpdate,
)


class DNSRecordService:
    def __init__(self, db: Session):
        self.record_repo = DNSRecordRepository(db)
        self.zone_repo = HostedZoneRepository(db)

    def _get_zone_or_404(self, zone_id: int):
        zone = self.zone_repo.get_by_id(zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hosted zone with id {zone_id} not found",
            )
        return zone

    def list_records(
        self,
        hosted_zone_id: int,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        filter_type: Optional[str] = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> DNSRecordListResponse:
        self._get_zone_or_404(hosted_zone_id)
        items, total = self.record_repo.list_by_zone(
            hosted_zone_id=hosted_zone_id,
            page=page,
            page_size=page_size,
            search=search,
            filter_type=filter_type,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        return DNSRecordListResponse(
            items=[DNSRecordResponse.model_validate(r) for r in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_record(self, record_id: int) -> DNSRecordResponse:
        record = self.record_repo.get_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DNS record with id {record_id} not found",
            )
        return DNSRecordResponse.model_validate(record)

    def create_record(self, hosted_zone_id: int, data: DNSRecordCreate) -> DNSRecordResponse:
        self._get_zone_or_404(hosted_zone_id)
        record = self.record_repo.create(hosted_zone_id, data)
        self.zone_repo.update_record_count(hosted_zone_id)
        return DNSRecordResponse.model_validate(record)

    def update_record(self, record_id: int, data: DNSRecordUpdate) -> DNSRecordResponse:
        record = self.record_repo.get_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DNS record with id {record_id} not found",
            )
        record = self.record_repo.update(record, data)
        return DNSRecordResponse.model_validate(record)

    def delete_record(self, record_id: int) -> None:
        record = self.record_repo.get_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DNS record with id {record_id} not found",
            )
        zone_id = record.hosted_zone_id
        self.record_repo.delete(record)
        self.zone_repo.update_record_count(zone_id)

    def bulk_delete_records(self, hosted_zone_id: int, record_ids: List[int]) -> int:
        self._get_zone_or_404(hosted_zone_id)
        deleted = self.record_repo.bulk_delete(record_ids, hosted_zone_id)
        self.zone_repo.update_record_count(hosted_zone_id)
        return deleted
