from celery import Celery
from app.config import settings


# Initialize the Celery app
celery_app = Celery(
    "worker",
    broker=settings.RABBITMQ_URL,
    backend="rpc://" # Using RPC for results, but DB is also fine
)

# Configure the app
celery_app.conf.update(
    task_track_started=True,
    # Route tasks to a specific queue
    task_routes={
        "app.worker.tasks.run_scan_task": {"queue": "scans"},
    },
)

# Import tasks to ensure they are registered
celery_app.autodiscover_tasks(['app.worker'])