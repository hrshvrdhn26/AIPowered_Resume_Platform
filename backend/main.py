from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from portfolio import ask_resume_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    conversation_id:str

@app.get("/")
def home():
    return {"message": "Resume AI Backend is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    response = ask_resume_question(request.question,request.conversation_id
)

    return StreamingResponse(
        response,
        media_type="text/plain"
    )