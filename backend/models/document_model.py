from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func

from database import Base

class Document(Base):
    __tablename__ = "documents"
    document_id = Column(
        String(40),
        primary_key=True
    )

    user_id  =Column(
        String(40),
        nullable=True,
        index=True
    )

    file_name = Column(
        String(255),
        nullable=False
    )
    pages = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

