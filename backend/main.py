from fastapi import FastAPI
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

from routes import auth_route
from routes import subscription_route
from routes import QA_document_route

from models.subscription_model import (Subscription, SubscriptionPaln)
from models.user_model import User
from models.document_model import Document

Base.metadata.create_all(
    bind = engine
)


app  = FastAPI(title="ConnectX Backend")
app.include_router(auth_route.router)
app.include_router(subscription_route.router)
app.include_router(QA_document_route.route)

app.add_middleware(
CORSMiddleware,
allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "https://connectx-two.vercel.app"],
allow_credentials=True,
allow_headers=["*"],
allow_methods=["*"]
)

@app.get("/")
def root():
    return{
        "message": "connectX api is running"
    }