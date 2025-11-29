import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Check if we are in a Docker environment
IS_DOCKER = os.environ.get("DOCKER_ENV") == "true"

class Settings(BaseSettings):
    """Loads and validates settings from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=None if IS_DOCKER else ".env", 
        extra="ignore"
    )

    DATABASE_URL: str
    RABBITMQ_URL: str
    
    # --- SECURITY CONFIG ---
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 
    
    # --- DEV MODE SWITCH ---
    # If True, the API will assume you are "admin" even without a token.
    AUTH_DISABLED: bool = True 

settings = Settings()
