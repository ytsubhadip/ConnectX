import os

from pinecone import Pinecone
from google import genai

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
        namespace="6",
        inputs= {
                "text": question
            },
        top_k =5,
        filter={
            "document_id": document_id,
            "user_id": user_id
        }
    )

    print("========== PINECONE RESULT ==========")
    print(serch_result)
    print("=====================================")


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

    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    answer = response.text

    return{
        "answer": answer,
        "sources" : chunks
    }


if __name__ == "__main__":
    ask_document("1","730d5364-f1d1-4864-9285-b4795745d935","Her journey is interesting because she started as")