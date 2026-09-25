from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from models.user_model import User
from database import get_db

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)
