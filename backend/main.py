from fastapi import FastAPI
from database import engine, Base

from routes import auth_route

Base.metadata.create_all(
    bind = engine
)

app  = FastAPI(title="ConnectX Backend")
app.include_router(auth_route.router)

@app.get("/")
def root():
    return{
        "message": "connectX api is running"
    }