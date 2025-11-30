from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from app.config import settings

app = FastAPI(
    title="SIH Vulnerability Scanner API",
    description="Backend for the Centralized Vulnerability Detection system.",
    version="0.1.0"
)

# --- CORS ---
origins = [
    "http://161.118.189.151:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://161.118.189.151:8000",
    "http://localhost:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REDIS STARTUP ---
@app.on_event("startup")
async def startup():
    redis = aioredis.from_url(settings.REDIS_URL)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API is running"}

app.include_router(api_router)
