from celery import Celery
from app.config import settings

# Initialize the Celery app
celery_app = Celery(
    "worker",
    broker=settings.RABBITMQ_URL,
    backend="rpc://"
)

# --- THIS IS THE FIX ---
# Enable broker heartbeats to keep the connection alive
# during long-running scans. A value of 60 sends a
# heartbeat every 60 seconds.
celery_app.conf.broker_heartbeat = 60
# --- END FIX ---

celery_app.conf.update(
    task_track_started=True,
    task_routes={
        "app.worker.tasks.run_scan_task": {"queue": "scans"},
    },
    # We must also set acks_late=True, so the task isn't
    # acknowledged *until after* it has finished running.
    task_acks_late=True
)

# Import tasks to ensure they are registered
celery_app.autodiscover_tasks(['app.worker'])
