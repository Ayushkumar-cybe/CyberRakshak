from fastapi import FastAPI
from app.api import router as api_router
# We no longer need this here
# from app.database import create_db_and_tables 

app = FastAPI(
    title="SIH Vulnerability Scanner API",
    description="Backend for the Centralized Vulnerability Detection system.",
    version="0.1.0"
)

# The on_startup event has been removed.

@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "message": "API is running"}

# Include the API routes
app.include_router(api_router)