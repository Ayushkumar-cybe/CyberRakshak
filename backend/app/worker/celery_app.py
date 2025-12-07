from celery import Celery
from app.config import settings

# Initialize the Celery app
celery_app = Celery(
    "worker",
    broker=settings.RABBITMQ_URL,
    backend="rpc://"
)

# Aggressive Heartbeat & Prefetch Configuration
celery_app.conf.update(
    broker_heartbeat=10,             # Send heartbeat every 10 seconds (Safer than 60)
    broker_connection_timeout=30,    # Timeout for connecting
    worker_prefetch_multiplier=1,    # Prevent worker from grabbing multiple heavy scans
    task_track_started=True,
    task_routes={
        "app.worker.tasks.run_scan_task": {"queue": "scans"},
    },
    task_acks_late=True              # Don't ack until the task is fully done
)

# Import tasks to ensure they are registered
celery_app.autodiscover_tasks(['app.worker'])
