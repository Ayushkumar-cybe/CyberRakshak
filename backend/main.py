from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

app = FastAPI(
    title="SIH Vulnerability Scanner API",
    description="Backend for the Centralized Vulnerability Detection system.",
    version="0.1.0"
)

origins = [
    "http://161.118.189.151:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://161.118.189.151:8000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "message": "API is running"}

app.include_router(api_router)
