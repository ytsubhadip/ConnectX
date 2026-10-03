import logging
from fastapi import APIRouter, status, HTTPException, Depends
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.user_model import User
from models.connection_model import Connection
from models.call_model import Call

from utils.auth import get_current_user
from database import get_db

from utils.notification_manager import notification_manager

router = APIRouter(
    prefix="/api/call",
    tags=["Video call"]
)


logger = logging.getLogger(__name__)
active_calls = {}

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

    if str(connection.status) != "accepted":
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

    # indentify the recipient

    if str(connection.sender_id) == str(current_user.id):
        receiver_id = connection.receiver_id

    else:
        receiver_id = connection.sender_id
    
    # create call record
    call = Call(
        caller_id=current_user.id,
        receiver_id=receiver_id,
        started_at=datetime.now(timezone.utc),
        status = "ringing"
    )

    db.add(call)
    db.commit()
    db.refresh(call)

    # send incoming-call notification
   
# Send incoming-call notification to the receiver
    delivered = await notification_manager.notify(
    str(receiver_id),
    {
        "type": "incoming_call",
        "call_id": str(call.id),
        "caller_id": str(current_user.id),
        "caller_name": getattr(current_user, "name", "A user")
    }
)

    if not delivered:
         logger.warning(
        "Call %s created, but live notification failed for user %s",
        call.id,
        receiver_id
    )

    return{
        "message":"call started",
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

    if call.status == "completed":
        return{
            "message":"call already ended",
            "duration": call.duration
        }
    
    ended_at = datetime.now(timezone.utc)
    setattr(call, "ended_at", ended_at)

    if call.started_at:
        started_at = call.started_at

        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)

        call.duration = max(
            0, int((ended_at - started_at).total_seconds()) 
        )

    call.status = "completed"

    db.commit()

    return{
        "message":"Call ended",
        "duration":call.duration
    }


# webrtc signaling  
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


             # Forward WebRTC signaling messages to the other participant
            for connection in list(active_calls.get(call_id, [])):

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


@router.websocket("/notification/{user_id}")
async def notification_websocket(
    websocket:WebSocket,
    user_id: str
):
    

    try:
        await notification_manager.connect(user_id, websocket)

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        pass

    except Exception:
        logger.exception("Notification WebScoket failed for user=%s", user_id)
        

    finally:
        notification_manager.disconnect(user_id, websocket)


