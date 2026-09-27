import os

from pinecone import Pinecone
from google import genai
from google.genai import errors

from dotenv import load_dotenv


load_dotenv()

# pinecone setup
pc = Pinecone(
    api_key = os.getenv("PINECONE_API_KEY")
)
index_name = os.getenv("PINECONE_INDEX_NAME") or ""
index = pc.index(index_name)


# gemini setup

gemini_client = genai.Client(
    api_key = os.getenv("GEMINI_API_KEY")
)



# ask document function

def ask_document(
        user_id : str,
        document_id: str,
        question: str
):
    # serch pinecone

    serch_result = index.search(
        namespace=str(user_id),
        inputs= {
                "text": question
            },
        top_k =3,
        filter={
            "document_id": document_id,
            "user_id": user_id
        }
    )


    # Extract chunk

    chunks = []

    for result in serch_result.result.hits:

        fields = result.fields

        text = fields.get("text")

        if text:
            chunks.append(text)

    # no relevant data

    if not chunks:
        return{
            "answer": "I could not find relevant information from this document",
            "souces" : []
        }

    context = "\n\n".join(chunks)

    # gemini prompt

    prompt = f"""
        You are a document question-answering assistant.
        Answer the user's question ONLY using the information
        provided in the document context below.

        If the answer cannot be found in the context,
        say that the information is not available in the document.

        Do not invent information.

        DOCUMENT CONTEXT:
        -----------------
        {context}
        -----------------

        USER QUESTION:
        {question}

        Answer clearly and concisely.
    """
    try:

        response = gemini_client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        answer = response.text

        return{
                "answer": answer,
                "sources" : chunks
            }

    except errors.ServerError as e:

        return{
            "answer": "Unable to access the AI model server right now. Please try again later.",
            "sources": []
        }

    except Exception as e:
         return {
        "answer": "Unable to generate an answer right now. Please try again later.",
        "sources": []
        }

   
if __name__ == "__main__":
    ask_document("1","730d5364-f1d1-4864-9285-b4795745d935","Her journey is interesting because she started as")