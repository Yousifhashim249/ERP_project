from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# عدّل معلومات الاتصال هنا حسب قاعدة بياناتك
DATABASE_URL = "postgresql://openpg:740203@localhost:5432/erp2_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    from models import Employee  # استدعاء جميع الجداول بعد تعريف Base
    Base.metadata.create_all(bind=engine)
