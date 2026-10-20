from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_env: str = "development"
    port: int = 8000
    frontend_url: str = "http://localhost:5173"
    model_path: Path = BACKEND_DIR / "models" / "model_param.pth"
    scaler_path: Path = BACKEND_DIR / "models" / "Scaler.pkl"
    log_level: str = "INFO"

    @field_validator("model_path", "scaler_path", mode="after")
    @classmethod
    def resolve_relative_path(cls, v: Path) -> Path:
        if not v.is_absolute():
            return BACKEND_DIR / v
        return v

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
