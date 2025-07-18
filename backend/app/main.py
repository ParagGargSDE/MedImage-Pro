from fastapi import FastAPI, UploadFile, File
from app import database, crud, ai_module
import shutil
import os

app = FastAPI()
UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.on_event("startup")
async def startup():
    await database.connect_db()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect_db()

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run AI Model
    findings = await ai_module.analyze_image(filepath)

    # Save metadata and report to DB
    image_id = await crud.save_image_and_report(file.filename, findings)

    return {"image_id": image_id, "report": findings}
