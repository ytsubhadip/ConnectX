from fastapi import APIRouter, status, HTTPException, Depends
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.user_model import User
from models.connection_model import Connection
from models.call_model import Call

from utils.auth import get_current_user
from database import get_db

router = APIRouter(
    prefix="/api/call",
    tags=["Video call"]
)

# call start route
@router.post("/start/{connection_id}")
async def start_call(
    connection_id: str,
    current_user: User =Depends(get_current_user),
    db: Session = Depends(get_db) 
):

    connection = db.query(Connection).filter(
        Connection.id == connection_id
    ).first()

    if not connection:
        raise HTTPException(
            status_code=404,
            detail="Connection not found"
        )

    if connection.status != "accepted":
        raise HTTPException(
            status_code=403,
            detail="You can only call an accepted connection"
        )
    
    if (
        str(connection.sender_id) != str(current_user.id)
        and
        str(connection.receiver_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to start this call"
        )

    if str(connection.sender_id) == str(current_user.id):
        receiver_id = connection.receiver_id

    else:
        receiver_id = connection.sender_id

    call = Call(
        caller_id=current_user.id,
        receiver_id=receiver_id,
        started_at=datetime.now(timezone.utc),
        status = "ringing"
    )

    db.add(call)
    db.commit()
    db.refresh(call)

    return{
        "call_id":str(call.id),
        "caller_id":str(call.caller_id),
        "receiver_id": str(call.receiver_id)
    }

# call end route
@router.post("/end/{call_id}")
async def end_call(
    call_id:str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    call = db.query(Call).filter(
        Call.id == call_id
    ).first()

    if not call:
        raise HTTPException(
            status_code=404,
            detail="call not found"
        )

    if(
        str(call.caller_id) != str(current_user.id)
        and
        str(call.receiver_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this call"
        )

    call.ended_at = datetime.now(timezone.utc)

    if call.started_at:
        call.duration  = int(
            (call.ended_at - call.started_at).total_seconds()
        )

    call.status = "completed"

    db.commit()

    return{
        "message":"Call ended",
        "duration":call.duration
    }

active_calls = {}

@router.websocket("/ws/{call_id}")
async def call_webscoket(
    webscoket: WebSocket,
    call_id: str
):
    await webscoket.accept()

    if call_id not in active_calls:
        active_calls[call_id] = []

    active_calls[call_id].append(webscoket)

    # Tell both user when the secound person joins
    if len(active_calls[call_id]) == 2:
        for connection in active_calls[call_id]:
            await connection.send_json({
                "type":"peer_joined"
            })


    try:
        while True:

            message = await webscoket.receive_json()

            # send message to the other participant
            for connection in active_calls[call_id]:

                if connection != webscoket:
                    await connection.send_json(message)


    except WebSocketDisconnect:

        if call_id in active_calls:

            if webscoket in active_calls[call_id]:
                active_calls[call_id].remove(webscoket)

            for connection in active_calls[call_id]:
                await connection.send_json({
                    "type": "peer_left"
                })

            if len(active_calls[call_id]) == 0:
                del active_calls[call_id]


