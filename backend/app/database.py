from sqlmodel import create_engine, Session, SQLModel
from app.config import settings

# Create the database engine
engine = create_engine(settings.DATABASE_URL)

def create_db_and_tables():
    """Initializes the database and creates tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """FastAPI dependency to get a database session."""
    with Session(engine) as session:
        yield session