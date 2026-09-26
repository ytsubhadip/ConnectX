from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Body, Path, Form
from sqlalchemy.orm import Session

import io 
import uuid
from pypdf import PdfReader

from database import get_db
from models.document_model import Document

from services.chunk_service import  create_chunks_from_pages
from services.pinecone_service import store_chunks


# MAX file size
max_size = 10 * 1024 * 2024 
route = APIRouter(
    prefix="/api/document",
    tags=["QA Document"]
)

@route.get("/")
async def get_document(
    user_id : str,
    db: Session = Depends(get_db)
):

    documents =(
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )

    if not documents:
        raise HTTPException(
            status_code=400,
            detail="Document not found"
        )

    return{
        "documents":[
            {
                "document_id": document.document_id,
                "file_name": document.file_name,
                "pages": document.pages,
                "created_at": document.created_at
            }
            for document in documents
        ]
    }


@route.post("/upload")
async def upload_document(
    user_id : str = Form(...),
    file : UploadFile = File(...),
    db : Session = Depends(get_db)):

    # check documnet type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only pdf files are allowed"
        )

    # read file
    file_content =  await file.read()

    # check file size
    if(len(file_content) > max_size):
        raise HTTPException(
            status_code=400,
            detail="file size cannot exceed 10 MB"
        )

    # generate document id
    document_id = str(uuid.uuid4())

    # Extract text from pdf
    try:
        pdf =PdfReader(io.BytesIO(file_content))

        pages =[]

        for page_number, page in  enumerate(pdf.pages, start=1):

            text = page.extract_text()

            if text and text.strip():
               pages.append({
                   "page": page_number,
                   "text":text.strip()
               })
                

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Could not read pdf"
        )

    # check extract text 

    if not pages:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from this pdf"
        )

    # create chunk
    chunks = create_chunks_from_pages(
        pages,
        chunk_size=1000,
        overlap=200
    )

    # store in pincone
    total_chunk = []
    try:
    

        store_chunks(
            document_id=document_id,
            user_id=user_id,
            file_name=file.filename or "uploaded.pdf",
            chunks=chunks
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"pinecone storage failed {e}"
        )

    # save database
    document = Document(
        document_id = document_id,
        user_id = user_id,
        file_name = file.filename,
        pages = len(pdf.pages)
    )

    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {
        "message": "PDF uploaded successfully",
        "document_id": document.document_id,
        "file_name": document.file_name,
        "pages": document.pages,
        "chunks": len(chunks)
    }