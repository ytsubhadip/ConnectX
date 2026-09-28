from pydantic import BaseModel

class ASkDocumetnQuestion(BaseModel):
    document_id:str
    question: str