from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import get_db
from models.user_model import User
from models.connection_model import Connection
from utils.auth import get_current_user

router = APIRouter(
    prefix="/api/connection",
    tags=["Connection"]
)   

# get all user
@router.get("/users")
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    user = db.query(User).filter(
        User.id != user_id
    ).all()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="user not found"
        )

    return {
        "users":[
            {
                "id":data.id,
                "name":data.name,
                "email": data.email,
                "role":data.role
            }
            for data in user
        ]
        }


# send connection request
@router.post("/request/{receiver_id}")
async def send_connection_request(
    receiver_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # cannot send request to yourself
    if current_user.id == receiver_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a connection request to yourself"
        )

    # check receiver exists
    receiver = db.query(User).filter(
        User.id == receiver_id
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # check existing connection/request
    existing_connection = db.query(Connection).filter(
        (
            (Connection.sender_id == current_user.id)
            & (Connection.receiver_id == receiver_id)
        )
        |
        (
            (Connection.sender_id == receiver_id)
            & (Connection.receiver_id == current_user.id)
        )
    ).first()

    if existing_connection:

        if(existing_connection.status == "pending"):
            raise HTTPException(
                status_code=400,
                detail="connection request already send"
            )
        
        if(existing_connection.status == "accepted"):
            raise HTTPException(
                status_code=400,
                detail="You are already connected"
            )

    connection = Connection(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        status="pending"
    )

    db.add(connection)
    db.commit()
    db.refresh(connection)

    return {
        "message": "Connection request sent successfully",
        "connection": {
            "id": connection.id,
            "sender_id": connection.sender_id,
            "receiver_id": connection.receiver_id,
            "status": connection.status
        }
    }


# show incoming pending request
@router.get("/requests")
async def get_connection_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    requests = db.query(Connection).filter(
        Connection.receiver_id == current_user.id,
        Connection.status == "pending"
    ).all()

    result = []

    for request in requests:

        sender = db.query(User).filter(
            User.id == request.sender_id
        ).first()

        if sender is None:
            raise HTTPException(
                status_code=400,
                detail="sender data not found"
            )

        result.append({
            "id": request.id,
            "sender_id": sender.id,
            "sender_name": sender.name,
            "sender_email": sender.email,
            "status":request.status
        })

    return{
        "request" : result
    }

@router.post("/accept/{connection_id}")
async def accept_connection(
    connection_id:str,
    current_user : User =Depends(get_current_user),
    db :Session = Depends(get_db)
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id
    ).first()

    if not connection:
        raise HTTPException(
            status_code=404,
            detail="connection request not found"
        )

    # only reciver can accept
    if connection.receiver_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot accept this request"
        )

    if str(connection.status) != "pending":
        raise HTTPException(
            status_code=400,
            detail="Request is not pending"
        )

    connection.status = "accepted"
    db.commit()
    db.refresh(connection)

    return{
        "message": "Connection accepted"
    }


# reject request
@router.post("/reject/{connection_id}")

async def reject_connection(
    connection_id:str,
    current_user :User = Depends(get_current_user),
    db :Session = Depends(get_db) 
):
    connection = db.query(Connection).filter(
        Connection.id == connection_id
    ).first()

    if not connection:
        raise HTTPException(
            status_code=404,
            detail="Connection request not found"
        )

    if connection.receiver_id != current_user.id:
        raise HTTPException(
            status_code=402,
            detail="you cannot reject this request"
        )
    connection.status = "rejected"
    db.commit()
    db.refresh(connection)

    return{
        "message": "connection rejected"
    }
# get accept connection list
@router.get("/connected")
async def get_connections(
    current_user : User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    connections = db.query(Connection).filter(
        Connection.status =="accepted",
        or_(
            Connection.sender_id == current_user.id,
            Connection.receiver_id == current_user.id
        )
    ).all()

    result = []

    for connection in connections:

        if connection.sender_id == current_user.id:
            other_user_id = connection.receiver_id
        else:
            other_user_id = connection.sender_id

        user = db.query(User).filter(
            User.id == other_user_id
        ).first()

        if user:
            result.append({
                "connection_id": connection.id,
                "user_id": user.id,
                "name": user.name,
                "email":user.email
            })


    return({
        "connections": result
        })
        

    


    

