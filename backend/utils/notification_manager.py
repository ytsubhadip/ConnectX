from fastapi import WebSocket


class NotificationManager:

    def __init__(self):
        self.connections = {} 

    async def connect(self, user_id:str, websocket: WebSocket):
        await websocket.accept()
        self.connections[str(user_id)] = websocket

    def disconnect(self, user_id:str):
        self.connections.pop(str(user_id), None)

    async def notify(self, user_id:str, messga:dict):
        websocket = self.connections.get(str(user_id))

        if websocket:
            await websocket.send_json(messga)
        else:
            pass

notification_manager = NotificationManager()