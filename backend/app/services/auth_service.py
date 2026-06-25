from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_email(data.email)

        if user is None:
            # On first login with demo credentials, create the user
            if data.email == settings.DEMO_EMAIL and data.password == settings.DEMO_PASSWORD:
                user = self.repo.create(
                    email=settings.DEMO_EMAIL,
                    password_hash=get_password_hash(settings.DEMO_PASSWORD),
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )
        else:
            if not verify_password(data.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

        token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return TokenResponse(access_token=token, token_type="bearer")

    def get_current_user(self, user_payload: dict) -> UserResponse:
        return UserResponse(id=user_payload["id"], email=user_payload["email"])
