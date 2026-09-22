from database import Base
from sqlalchemy import Column, Integer, String, DateTime,UUID
from sqlalchemy.sql import func


# user table schema

class User(Base):
    __tablename__= "users"

    id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default='user', nullable=False)
    create_at = Column(DateTime, server_default= func.now())

