from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from database import Base
from sqlalchemy.sql import func


class SubscriptionPaln(Base):
    __tablename__ = "subscription_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    name =  Column(
        String(100),
        nullable=False  
    )
    price = Column(
        Float,
        nullable=False
    )
    credits = Column(
        Float,
        nullable=True
        )

    description = Column(
        String(255)
    )


class Subscription(Base):
    __tablename__ ="subscription"

    id = Column(
        Integer, 
        primary_key=True, 
        index=True
        )
    
    user_id = Column(
        Integer, 
        ForeignKey("users.id"), 
        nullable=False
        )
    
    plan_id = Column(
        Integer,
        ForeignKey("subscription_plans.id"),
        nullable=False
            )

    amount = Column(
        Float,
        nullable=False
    )
    credits = Column(
        Integer,
        nullable=True
    )
    status = Column(
        String(30),
        default="activate"
    )
    created_at = Column(
        DateTime,
        server_default=func.now()
    )