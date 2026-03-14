import io
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from google import genai
from google.genai import types
from PIL import Image
import pillow_heif
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

pillow_heif.register_heif_opener()
app = FastAPI()
load_dotenv()

# Cấu hình CORS để Frontend React gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEY trong file .env!")

client = genai.Client(api_key=API_KEY)


@app.post("/api/scan-food")
async def scan_food(file: UploadFile = File(...)):
    try:
        # Đọc dữ liệu ảnh giống cách AI Studio xử lý
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # Prompt tối ưu để lấy JSON chuẩn cho SnapEat
        prompt = """
        Xác định món ăn trong ảnh và cung cấp thông tin dinh dưỡng.
        Trả về định dạng JSON với các trường: 
        name (tên món), calories (kcal), protein (g), carbs (g), fat (g).
        """

        # Gọi Gemini 1.5 Flash (Model tốt nhất cho Vision miễn phí)
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[prompt, img],
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING"},
                        "calories": {"type": "NUMBER"},
                        "protein": {"type": "NUMBER"},
                        "carbs": {"type": "NUMBER"},
                        "fat": {"type": "NUMBER"}
                    },
                    "required": ["name", "calories", "protein", "carbs", "fat"]
                }
            }
        )
        return response.parsed

    except Exception as e:
        print(f"Lỗi AI: {str(e)}")
        raise HTTPException(status_code=500, detail="Không thể phân tích ảnh")

# =====================
# Main
# =====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
