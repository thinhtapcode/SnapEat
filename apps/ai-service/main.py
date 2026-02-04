import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vision_ai import analyze_food_image, analyze_food_text
import tempfile

app = FastAPI()

# =====================
# CORS
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Schemas
# =====================
class AnalyzeRequest(BaseModel):
    text: str

# =====================
# Routes
# =====================
@app.post("/api/scan-image")
async def scan_food_image(image: UploadFile = File(...)):
    try:
        # Lưu tạm file upload vào disk vì YOLOv8 cần path
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(image.filename)[1]) as tmp:
            tmp.write(await image.read())
            tmp_path = tmp.name
        
        result = analyze_food_image(tmp_path)
        os.remove(tmp_path)  # xóa file tạm sau khi scan
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-text")
async def analyze_text(req: AnalyzeRequest):
    try:
        result = analyze_food_text(req.text)
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================
# Main
# =====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
