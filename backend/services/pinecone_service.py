from pinecone import Pinecone
import os

pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

index_name = os.getenv("PINECONE_INDEX_NAME")
if index_name is None:
    raise ValueError("PINECONE_INDEX_NAME environment variable is required")

index = pc.Index(index_name)


def store_vectors(vectors):
    index.upsert(vectors=vectors)


def store_chunks(
    document_id:str,
    user_id:str,
    file_name:str,
    chunks:list
):
    records = []
    for i, chunk in enumerate(chunks):
        records.append({
            "_id":f"{document_id}_{i}",
            "text":chunk["text"],
            "document_id": document_id,
            "user_id": str(user_id),
            "file_name":file_name,
            "chunk_index":i
        })

        index.upsert_records(
            namespace=str(user_id),
            records=records
        )

        return len(records)