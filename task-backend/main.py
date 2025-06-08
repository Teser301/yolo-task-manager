from fastapi import FastAPI
from database.db import engine
from database.db import Base
from api.routes import task, category
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Task Management REST-API",
    version="1.0.0"
)

app.include_router(task.router)
app.include_router(category.router)

origins = [
    "http://localhost:4200",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Task Management API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

