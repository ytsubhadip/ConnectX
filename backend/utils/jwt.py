import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUITES = os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES")


# def create_access_token(data: dict):
#     to_encome = data.copy()
#     expire = w