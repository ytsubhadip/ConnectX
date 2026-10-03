from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from database import Base
import uuid

class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    caller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    duration = Column(Integer, default=0)  # seconds

    status = Column(String(20), default="started")
    