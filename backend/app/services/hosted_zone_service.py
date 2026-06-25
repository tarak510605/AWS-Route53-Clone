from __future__ import annotations

import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneListResponse,
    HostedZoneResponse,
    HostedZoneUpdate,
)


class HostedZoneService:
    def __init__(self, db: Session):
        self.repo = HostedZoneRepository(db)

    def list_zones(
        self,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        filter_type: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> HostedZoneListResponse:
        items, total = self.repo.list(
            page=page,
            page_size=page_size,
            search=search,
            filter_type=filter_type,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        return HostedZoneListResponse(
            items=[HostedZoneResponse.model_validate(z) for z in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_zone(self, zone_id: int) -> HostedZoneResponse:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hosted zone with id {zone_id} not found",
            )
        return HostedZoneResponse.model_validate(zone)

    def create_zone(self, data: HostedZoneCreate) -> HostedZoneResponse:
        existing = self.repo.get_by_name(data.zone_name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Hosted zone '{data.zone_name}' already exists",
            )
        zone = self.repo.create(data)
        return HostedZoneResponse.model_validate(zone)

    def update_zone(self, zone_id: int, data: HostedZoneUpdate) -> HostedZoneResponse:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hosted zone with id {zone_id} not found",
            )
        zone = self.repo.update(zone, data)
        return HostedZoneResponse.model_validate(zone)

    def delete_zone(self, zone_id: int) -> None:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hosted zone with id {zone_id} not found",
            )
        self.repo.delete(zone)
