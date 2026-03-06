"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "TetherX Blood Bank API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # JWT
    SECRET_KEY: str = "tetherx-dev-secret-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
