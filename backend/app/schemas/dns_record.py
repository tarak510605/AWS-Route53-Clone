from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

VALID_RECORD_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}
VALID_ROUTING_POLICIES = {"Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"}


class DNSRecordBase(BaseModel):
    name: str
    type: str
    value: str
    ttl: int = 300
    routing_policy: str = "Simple"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Record name cannot be empty")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in VALID_RECORD_TYPES:
            raise ValueError(f"Record type must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
        return v

    @field_validator("ttl")
    @classmethod
    def validate_ttl(cls, v: int) -> int:
        if v < 0:
            raise ValueError("TTL must be a non-negative integer")
        if v > 2147483647:
            raise ValueError("TTL exceeds maximum value")
        return v

    @field_validator("value")
    @classmethod
    def validate_value(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Record value cannot be empty")
        return v

    @field_validator("routing_policy")
    @classmethod
    def validate_routing_policy(cls, v: str) -> str:
        if v not in VALID_ROUTING_POLICIES:
            raise ValueError(f"Routing policy must be one of: {', '.join(sorted(VALID_ROUTING_POLICIES))}")
        return v


class DNSRecordCreate(DNSRecordBase):
    pass


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    value: Optional[str] = None
    ttl: Optional[int] = None
    routing_policy: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.upper().strip()
            if v not in VALID_RECORD_TYPES:
                raise ValueError(f"Record type must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
        return v

    @field_validator("ttl")
    @classmethod
    def validate_ttl(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v < 0:
                raise ValueError("TTL must be a non-negative integer")
            if v > 2147483647:
                raise ValueError("TTL exceeds maximum value")
        return v

    @field_validator("routing_policy")
    @classmethod
    def validate_routing_policy(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_ROUTING_POLICIES:
            raise ValueError(f"Routing policy must be one of: {', '.join(sorted(VALID_ROUTING_POLICIES))}")
        return v


class DNSRecordResponse(DNSRecordBase):
    id: int
    hosted_zone_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DNSRecordListResponse(BaseModel):
    items: List[DNSRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteRequest(BaseModel):
    ids: List[int]
