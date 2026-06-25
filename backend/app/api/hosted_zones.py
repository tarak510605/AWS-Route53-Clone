from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneListResponse,
    HostedZoneResponse,
    HostedZoneUpdate,
)
from app.services.hosted_zone_service import HostedZoneService

router = APIRouter(prefix="/hosted-zones", tags=["Hosted Zones"])


@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    current_user: CurrentUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    filter_type: Optional[str] = Query(default=None, pattern="^(private|public)$"),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
):
    service = HostedZoneService(db)
    return service.list_zones(
        page=page,
        page_size=page_size,
        search=search,
        filter_type=filter_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    data: HostedZoneCreate,
    current_user: CurrentUser,
    db: DBSession,
):
    service = HostedZoneService(db)
    return service.create_zone(data)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    service = HostedZoneService(db)
    return service.get_zone(zone_id)


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: int,
    data: HostedZoneUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    service = HostedZoneService(db)
    return service.update_zone(zone_id, data)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    service = HostedZoneService(db)
    service.delete_zone(zone_id)
