from sqlmodel import Session, select
from app.database import engine
from app.models import User
from app.auth import get_password_hash

def create_admin():
    with Session(engine) as session:
        # Check if admin exists
        existing_user = session.exec(select(User).where(User.username == "admin")).first()
        if existing_user:
            print("Admin user already exists.")
            return

        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        session.add(admin_user)
        session.commit()
        print("Admin user created! (Username: admin, Password: admin123)")

if __name__ == "__main__":
    create_admin()
