from pydantic import BaseModel

class ASkDocumetnQuestion(BaseModel):
    user_id :str
    document_id:str
    question: str