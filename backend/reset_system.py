import os
import shutil
from sqlmodel import Session, delete, text
from app.database import engine
from app.models import Job, AuditLog

def reset_data():
    print("--- STARTING SYSTEM RESET ---")
    
    # 1. Clear Database Tables
    with Session(engine) as session:
        print("Deleting Audit Logs...")
        session.exec(delete(AuditLog))
        
        print("Deleting Jobs...")
        session.exec(delete(Job))
        
        session.commit()
        print("Database tables cleared.")

    # 2. Clear Output Files
    outputs_dir = "/app/outputs" # Internal container path
    if os.path.exists(outputs_dir):
        print(f"Cleaning outputs directory: {outputs_dir}")
        for item in os.listdir(outputs_dir):
            # Skip hidden files like .gitkeep
            if item.startswith("."): continue
            
            item_path = os.path.join(outputs_dir, item)
            try:
                if os.path.isfile(item_path) or os.path.islink(item_path):
                    os.unlink(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)
            except Exception as e:
                print(f"Failed to delete {item_path}. Reason: {e}")
        print("Output files cleaned.")
    
    print("--- RESET COMPLETE ---")

if __name__ == "__main__":
    reset_data()
