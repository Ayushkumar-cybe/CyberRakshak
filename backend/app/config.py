import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Check if we are in a Docker environment
# We will set this variable in our docker-compose.yml
IS_DOCKER = os.environ.get("DOCKER_ENV") == "true"

class Settings(BaseSettings):
    """Loads and validates settings from environment variables."""
    
    # Load from .env file ONLY if NOT in Docker
    model_config = SettingsConfigDict(
        env_file=None if IS_DOCKER else ".env", 
        extra="ignore"
    )

    DATABASE_URL: str
    RABBITMQ_URL: str

# Create a single, reusable instance of the settings
settings = Settings()