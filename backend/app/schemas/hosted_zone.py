from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class HostedZoneBase(BaseModel):
    zone_name: str
    comment: Optional[str] = ""
    private_zone: bool = False

    @field_validator("zone_name")
    @classmethod
    def validate_zone_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Zone name cannot be empty")
        if len(v) > 255:
            raise ValueError("Zone name cannot exceed 255 characters")
        # Ensure it ends with a dot (Route53 convention)
        if not v.endswith("."):
            v = v + "."
        return v


class HostedZoneCreate(HostedZoneBase):
    pass


class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = None
    private_zone: Optional[bool] = None


class HostedZoneResponse(HostedZoneBase):
    id: int
    record_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HostedZoneListResponse(BaseModel):
    items: List[HostedZoneResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
