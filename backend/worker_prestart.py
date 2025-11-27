# worker_prestart.py
import time
import socket
from sqlmodel import create_engine, SQLModel
from app.config import settings
from app.database import engine

# !! THIS IS THE FIX for the 'job' table !!
# We must explicitly import the models to register them
from app.models import Job 

def wait_for_db():
    """Waits for the database to be ready."""
    print('--- Waiting for database to be ready... ---')
    retries = 10
    while retries > 0:
        try:
            with engine.connect() as conn:
                print('--- Database is ready! ---')
                return True
        except Exception as e:
            print(f'Database not ready, retrying... ({retries} left)')
            retries -= 1
            time.sleep(3)
    
    print('--- Database connection failed! ---')
    return False

def create_tables():
    """Creates the database tables."""
    print('--- Creating database tables... ---')
    # Now this command will correctly create the 'job' table
    SQLModel.metadata.create_all(engine)
    print('--- Database tables checked/created. ---')

def wait_for_rabbitmq():
    """Waits for the RabbitMQ server to be ready."""
    print('--- Waiting for RabbitMQ to be ready... ---')
    retries = 10
    while retries > 0:
        try:
            # We use the 'rabbitmq' hostname from docker-compose
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(2)
                result = sock.connect_ex(('rabbitmq', 5672))
                if result == 0:
                    print('--- RabbitMQ is ready! ---')
                    return True
                else:
                    raise ConnectionRefusedError
        except Exception as e:
            print(f'RabbitMQ not ready, retrying... ({retries} left)')
            retries -= 1
            time.sleep(3)

    print('--- RabbitMQ connection failed! ---')
    return False

if __name__ == "__main__":
    if wait_for_db():
        create_tables()
        if not wait_for_rabbitmq():
            exit(1) # Exit if RabbitMQ fails
    else:
        exit(1) # Exit if DB fails
