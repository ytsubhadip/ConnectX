from fastapi import APIRouter, HTTPException, status, Depends
from database import get_db
from sqlalchemy.orm import Session

from models.subscription_model import SubscriptionPaln, Subscription
from models.user_model import User, WalletTransaction




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
    user_id : int,
    db:Session = Depends(get_db)
):

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
    user_id : int,
    db : Session = Depends(get_db)
):
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
    user_id :int,
    db :Session=Depends(get_db)
):
    transactions  =db.query(
        WalletTransaction
    ).filter(
         WalletTransaction.user_id == user_id
    ).order_by(
        WalletTransaction.created_at.desc()
    ).all()

    return transactions


    



    
