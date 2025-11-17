from celery import Celery
from app.config import settings

# Initialize the Celery app
celery_app = Celery(
    "worker",
    broker=settings.RABBITMQ_URL,
    backend="rpc://"
)

celery_app.conf.update(
    task_track_started=True,
    task_routes={
        "app.worker.tasks.run_scan_task": {"queue": "scans"},
    },
    # --- FIX: Stop Redelivery Loop ---
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    broker_heartbeat=0, 
    # -------------------------------
)

celery_app.autodiscover_tasks(['app.worker'])
