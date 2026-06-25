from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: DBSession):
    service = AuthService(db)
    return service.login(data)


@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser, db: DBSession):
    service = AuthService(db)
    return service.get_current_user(current_user)
