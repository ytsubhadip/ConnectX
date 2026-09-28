from fastapi import APIRouter, HTTPException, status, Depends
from database import get_db
from sqlalchemy.orm import Session

from models.subscription_model import SubscriptionPaln, Subscription
from models.user_model import User, WalletTransaction
from utils.auth import get_current_user




router = APIRouter(
    prefix="/api/subscription",
    tags=["subscriptions"]
)

# get all plan
@router.get("/plans")
async def get_plans(db : Session =Depends(get_db)):
    plans = db.query(SubscriptionPaln).all()

    return plans

@router.post("/subscribe/{plan_id}")
async def subscribe(
    plan_id: int,
    currecnt_user :User = Depends(get_current_user),
    db:Session = Depends(get_db)
):

    user_id = currecnt_user.id

    plan = db.query(SubscriptionPaln).filter(
        SubscriptionPaln.id == plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code= 404,
            detail="Plan not found"
        )
    user = db.query(User).filter(
        User.id == user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # mock payment
    payment_success = True

    if not payment_success:
        raise HTTPException(
            status_code=400,
            detail="Payment failed"
        )

    # create subscription
    UserSubscription = Subscription(
        user_id = user_id,
        plan_id = plan.id,
        amount = plan.price,
        credits = plan.credits,
        status = 'activate'
    )

    db.add(UserSubscription)

    # Add credits to wallet
    user.wallet_balance += plan.credits

    #   Create transation 
    transation  = WalletTransaction(
        user_id =user.id,
        amount = plan.price,
        transation_type = "credit"
    )

    db.add(transation)

    db.commit()
    db.refresh(UserSubscription)

    return{
        "message":"Subscription Successful",
        "plan": plan.name,
        "credits_add" :plan.credits,
        "wallet_balance":user.wallet_balance
    }

@router.get("/wallet")
async def get_wallet(
    currecnt_user :User = Depends(get_current_user),
    db : Session = Depends(get_db)
):
    user_id = currecnt_user.id
    user = db.query(User).filter(
             User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return{
        "wallet_ballance": user.wallet_balance
    }

@router.get("/wallet/transactions")
async def get_transations(
    current_user : User = Depends(get_current_user),
    db :Session=Depends(get_db)
):
    user_id= current_user.id
    transactions  =db.query(
        WalletTransaction
    ).filter(
         WalletTransaction.user_id == user_id
    ).order_by(
        WalletTransaction.created_at.desc()
    ).all()

    return transactions


    



    
