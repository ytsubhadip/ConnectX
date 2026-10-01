from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from models.user_model import User
from database import get_db

from models.user_model import User, WalletTransaction
from models.subscription_model import Subscription
from models.document_model import Document
from models.connection_model import Connection

from utils.auth import get_current_user


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# Admin check

def get_admin_user(
        current_user: User = Depends(get_current_user)
):
    """
    allow only admin users
    """

    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="user not found"
        )

    # change this accoring to your User model
    if getattr(current_user, "role",None) != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user

# Admin dashboard statistics
@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    admin : User = Depends(get_admin_user)
):
    
    """
    get overall statistics from admin dashboard.
    """

    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_connections = db.query(Connection).count()

    active_subscriptions = (
        db.query(Subscription).filter(
            Subscription.status == "activate"
        )
        .count()
    )

    # total wallet balance
    total_wallet_balance =(
        db.query(
            func.coalesce(
                func.sum(User.wallet_balance),
                0
            )
        )   .scalar()
    )

    return{

        "total_users" :total_users,
        "active_subscriptions" : active_subscriptions,
        "total_wallet_balance" :float(
            total_wallet_balance or 0
        ),
        "total_documents" : total_documents,
        "total_connections": total_connections
    }

# get all users

@router.get("/users")
async def get_all_users(
admin : User = Depends(get_admin_user),
db: Session = Depends(get_db)
):

    """
    admin can see all users
    """
    users =(
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    result =[]

    for user in users:

        result.append({
            "id": str(user.id),
            "name" :getattr(user, "name", None),
            "email" :getattr(user,"email", None),
            "role" :getattr(user, "role", None)
        })

    return{
        "total": len(result),
        "users": result
    }

# get particular user
@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db : Session = Depends(get_db),
):
    
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return({
        "id": str(user.id),
        "name":  getattr(user, "name", None),
        "email": getattr(user, "email", None),
        "role":getattr(user, "role", None),
        "created_at": getattr(user, "create_at", None)
    })

# active subscription
@router.get("/subscription")
async def get_admin_subscription(
    db: Session = Depends(get_db),
    admin : User= Depends(get_admin_user) 
):
    """
    show active subscription
    """
    subscriptions = (
        db.query(Subscription).filter(
            Subscription.status == "activate"
        )
        .order_by(
            Subscription.id.desc()
        )
        .all()
    )

    result = []

    for subscription in subscriptions:
        result.append({
            "id": str(subscription.id),
            "user_id":str(getattr(subscription, "user_id","")),
            "plan_id": str(getattr(subscription,"plan_id","")),
            "status":str(getattr(subscription,"status", None))
        })

    return({
        "total": len(result),
        "subscriptions": result
    })

# wallet balances
@router.get("/wallets")
async def get_admin_wallets(
    db: Session = Depends(get_db),
    admin : User = Depends(get_admin_user)
):

    wallets = (
        db.query(User).order_by(User.id.desc()).all()
    )

    result = []

    for wallet in wallets:
        result.append({
            "user_id": str(wallet.id),
            "balance": str(wallet.wallet_balance)
        })

    return{
        "total": len(result),
        "wallets": result
    }

# upload documents
@router.get("/documents")
async def get_admin_documents(
    db:Session=Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # show documents uploaded by users
    documents = (
        db.query(Document).all()
    )

    result = []

    for document in documents:

        result.append({
            "id": str(document.document_id),
            "user_id": str(
                getattr(document, "user_id", "")    
            ),
            "filename" :getattr(
                document,"file_name", ""
            ),
            "created_at": getattr(
                document, "created_at", None
            )
        })

    return({
            "total":len(result),
            "documents": result
        })


# connection requests
@router.get("/connections")
async def get_admin_connectios(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # show connection request history

    connections =(
        db.query(Connection).order_by(Connection.id.desc()).all()
    )

    result = []

    for connection in connections:

        result.append({
            "id": str(connection.id),
            "sender_id": str(getattr(connection,"sender_id","")),
            "receiver_id": str(getattr(connection,"receiver_id","")),
            "status":str(getattr(connection, "status",""))
        })

    return({
        "total": len(result),
        "connections": result
    })













