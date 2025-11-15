#!/bin/bash

# This command runs a small Python script to create the tables
# It waits for the database to be ready before trying.
python -c "
import time
from sqlmodel import create_engine, SQLModel
from app.config import settings
from app.database import engine

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

if retries == 0:
    print('--- Database connection failed! ---')
    exit(1)

print('--- Creating database tables... ---')
SQLModel.metadata.create_all(engine)
print('--- Database tables checked/created. ---')
"

# Now that the tables are created, execute the original CMD
# (This starts the Celery worker)
echo "--- Starting Celery worker... ---"
celery -A app.worker.celery_app worker --loglevel=info -P solo -Q scans