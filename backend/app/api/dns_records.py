from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.dns_record import (
    BulkDeleteRequest,
    DNSRecordCreate,
    DNSRecordListResponse,
    DNSRecordResponse,
    DNSRecordUpdate,
)
from app.services.dns_record_service import DNSRecordService

router = APIRouter(tags=["DNS Records"])


# Records under a hosted zone
@router.get("/hosted-zones/{zone_id}/records", response_model=DNSRecordListResponse)
def list_dns_records(
    zone_id: int,
    current_user: CurrentUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    filter_type: Optional[str] = Query(default=None),
    sort_by: str = Query(default="name"),
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
):
    service = DNSRecordService(db)
    return service.list_records(
        hosted_zone_id=zone_id,
        page=page,
        page_size=page_size,
        search=search,
        filter_type=filter_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "/hosted-zones/{zone_id}/records",
    response_model=DNSRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_dns_record(
    zone_id: int,
    data: DNSRecordCreate,
    current_user: CurrentUser,
    db: DBSession,
):
    service = DNSRecordService(db)
    return service.create_record(zone_id, data)


@router.delete(
    "/hosted-zones/{zone_id}/records/bulk",
    status_code=status.HTTP_200_OK,
)
def bulk_delete_records(
    zone_id: int,
    data: BulkDeleteRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    service = DNSRecordService(db)
    deleted = service.bulk_delete_records(zone_id, data.ids)
    return {"deleted": deleted}


# Individual record endpoints
@router.get("/records/{record_id}", response_model=DNSRecordResponse)
def get_dns_record(
    record_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    service = DNSRecordService(db)
    return service.get_record(record_id)


@router.put("/records/{record_id}", response_model=DNSRecordResponse)
def update_dns_record(
    record_id: int,
    data: DNSRecordUpdate,
    current_user: CurrentUser,
    db: DBSession,
):
    service = DNSRecordService(db)
    return service.update_record(record_id, data)


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(
    record_id: int,
    current_user: CurrentUser,
    db: DBSession,
):
    service = DNSRecordService(db)
    service.delete_record(record_id)
