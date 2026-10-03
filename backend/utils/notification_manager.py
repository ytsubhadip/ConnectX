import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)
class NotificationManager:

    def __init__(self):
        self.connections = {} 

    async def connect(self, user_id:str, websocket: WebSocket):


        await websocket.accept()
        self.connections[user_id] = websocket

        logger.info("Notification Connected: user=%s", user_id)


    def disconnect(self, user_id:str, webscoket: WebSocket):

        currect = self.connections.get(user_id)

        if currect is not None and(
            webscoket is None or currect in WebSocket
        ):
            
            self.connections.pop(user_id, None)
            logger.info("NOtification disconnected: user=%s",user_id)

    
    async def notify(self, user_id:str, messga:dict) -> bool:


        websocket = self.connections.get(user_id)

        if websocket is None:
            logger.warning("Notification not delivered: user %s is offline", user_id)
            return False

        try:
            await websocket.send_json(messga)

            logger.info(
                "Notification sent: user=%s type=%s",
                user_id,
                messga.get("type")
            )
            return True

        except Exception:
            logger.exception(
                "Notification send failed : user=%s",
                user_id
            )

            self.disconnect(user_id, websocket)

            return False


notification_manager = NotificationManager()