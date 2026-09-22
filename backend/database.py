import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()


DATABASR_URL = str(os.getenv("DATABASE_URL"))

# create engine
engine = create_engine(
    DATABASR_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush= False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db

    finally:
        db.close()
