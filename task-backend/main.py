from fastapi import FastAPI
from database.db import engine
from database.db import Base
from api.routes import task, category

app = FastAPI(
    title="Task Management REST-API",
    version="1.0.0"
)

app.include_router(task.router)
app.include_router(category.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Task Management API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)