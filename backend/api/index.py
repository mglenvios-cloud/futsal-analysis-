from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"status": "ok", "service": "Futsal Analysis API"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Futsal Analysis API", "version": "1.0.0"}
