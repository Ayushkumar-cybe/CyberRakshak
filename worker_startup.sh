#!/bin/bash

# === PART 1: WAIT FOR DB & CREATE TABLES ===
python -c "
import time
from sqlmodel import create_engine, SQLModel
from app.config import settings
from app.database import engine
from app.models import Job  # This is the critical import

print('--- Waiting for database to be ready... ---')
retries = 10
while retries > 0:
    try:
        with engine.connect() as conn:
            print('--- Database is ready! ---')
            break
    except Exception as e:
        print(f'Database not ready, retrying... ({retries} left)')
        retries -= 1
        time.sleep(3)
else:
    print('--- Database connection failed! ---')
    exit(1) # Correct exit for Python

print('--- Creating database tables... ---')
SQLModel.metadata.create_all(engine)
print('--- Database tables checked/created. ---')
"

# === PART 2: WAIT FOR RABBITMQ (Correct Bash Syntax) ===
echo "--- Waiting for RabbitMQ to be ready... ---"
retries=10 # No spaces around '='
while [ $retries -gt 0 ]; do
    # We redirect error output to /dev/null
    celery -A app.worker.celery_app inspect ping -d "celery@$(hostname)" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "--- RabbitMQ is ready! ---"
        break
    fi
    
    echo "RabbitMQ not ready, retrying... ($retries left)"
    retries=$((retries - 1))
    sleep 3
done

if [ $retries -eq 0 ]; then
    echo "--- RabbitMQ connection failed! ---"
    exit 1 # Correct exit for Bash
fi

# === PART 3: START THE WORKER ===
echo "--- Starting Celery worker... ---"
celery -A app.worker.celery_app worker --loglevel=info -P solo -Q scans
