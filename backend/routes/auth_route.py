from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from database import Base, get_db
from models.user_model import User
from schemas.user import LoginRequest, RegisterRequest, AdminLogin, AdminRegister

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

@router.post("/admin-register")
async def admin_register(user_data: AdminRegister, db: Session = Depends(get_db)):

    # check email already exist 
    user = db.query(User).filter(
         User.email ==user_data.email
    ).first()

    if user:
         raise HTTPException(
              status_code=400,
              detail="Email already register"
         )

    new_admin = User(
         name = user_data.name,
         email= user_data.email,
         password = user_data.password,
         role = "admin"
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return{
         "message": "Admin register successfully",
         "admin":{
              "id": new_admin.id,
              "name": new_admin.name,
              "email": new_admin.email,
              "role": new_admin.role
         }
    }


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


@router.post("/admin-login")
async def admin_login(user_data:AdminLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(
         User.email == user_data.email
    ).first()

    if not user:
         raise HTTPException(
              status_code=401,
              detail="Invalid email or password"
         )

    if getattr(user, "role", None) != "admin":
         raise HTTPException(
              status_code=403,
              detail="Admin access required"
         )

    if user.password != user_data.password:
         raise HTTPException(
              status_code=401,
              detail="Invalid Password"
         )
    
    return{         
          "message": "Admin login successful",
          "admin":{
               "id": user.id,
               "name": user.name,
               "email": user.email,
               "role":user.role
          }
    }


