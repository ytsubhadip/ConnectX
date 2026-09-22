from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from database import Base, get_db
from models.user_model import User
from schemas.user import LoginRequest, RegisterRequest

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(userData: RegisterRequest,
                   db :Session= Depends(get_db)
                   ):

    # check user already exist
    user = db.query(User).filter(
        User.email == userData.email
    ).first()

    if user:

        raise HTTPException(
            status_code=400,
            detail="Email already register"
        )


    # create user
    new_user = User(
        name = userData.name,
        email =userData.email,
        password = userData.password,
        role = 'user',
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
async def login(userData: LoginRequest,
                db: Session = Depends(get_db)
                ):
       
       user = db.query(User).filter(
            User.email == userData.email
       ).first()

       if not user:
            raise HTTPException(
                 status_code=401,
                 detail="Invalid Email or password"
            )
        # password check
       if (userData.password != user.password):
            raise HTTPException(
                 status_code=401,
                 detail="Invalid Password"
            )

       return{
            "message": "successfull",
            "user": user
       }



