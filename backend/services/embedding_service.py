from google import genai
import os

from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def create_embedding(text:str):
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    if not response.embeddings:
        raise ValueError("No embedding was returned")
    return response.embeddings[0].values


if __name__ =="__main__":
    text = "text is the error"
    print(create_embedding(text))