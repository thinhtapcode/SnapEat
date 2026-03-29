import io
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from google import genai
from PIL import Image
import pillow_heif
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Đăng ký opener cho file HEIC (iPhone)
pillow_heif.register_heif_opener()
load_dotenv()

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lấy danh sách API Keys
API_KEYS = [k.strip() for k in os.getenv("GEMINI_API_KEYS", "").split(",") if k.strip()]
if not API_KEYS:
    raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEYS trong file .env!")

# Danh sách Model dự phòng (Sử dụng dòng 2.0 để tối ưu tốc độ và quota)
MODEL_PRIORITY = [
    "gemini-flash-latest",
    "gemini-2.0-flash",      
    "gemini-2.0-flash-lite",  

]

# Khởi tạo clients
clients = [genai.Client(api_key=key) for key in API_KEYS]
current_key_index = 0

def get_next_client_index():
    global current_key_index
    current_key_index = (current_key_index + 1) % len(clients)
    return current_key_index

@app.post("/api/scan-food")
async def scan_food(file: UploadFile = File(...)):
    # Đọc dữ liệu ảnh 1 lần duy nhất để giữ nguyên chất lượng gốc
    contents = await file.read()
    
    # Duyệt qua từng API Key (Failover tầng 1)
    for _ in range(len(clients)):
        client = clients[current_key_index]
        
        # Với mỗi Key, thử qua các Model (Failover tầng 2)
        for model_name in MODEL_PRIORITY:
            try:
                # Mở ảnh bằng PIL nhưng không resize/nén để giữ độ chính xác
                img = Image.open(io.BytesIO(contents))
                if img.mode != "RGB":
                    img = img.convert("RGB")
                
                prompt = """
                Xác định món ăn trong ảnh và cung cấp thông tin dinh dưỡng.
                Trả về định dạng JSON với các trường: 
                name (tên món), calories (kcal), protein (g), carbs (g), fat (g).
                """

                response = client.models.generate_content(
                    model=model_name,
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
                
                # Trả về kết quả ngay nếu thành công
                print(f"✅ Thành công với Key {current_key_index} - Model {model_name}")
                return response.parsed

            except Exception as e:
                error_str = str(e).lower()
                # Nếu hết quota (429) HOẶC không tìm thấy model (404)
                if any(x in error_str for x in ["429", "quota", "404", "not_found"]):
                    print(f"⚠️ Thử thách với {model_name} thất bại. Đang đổi...")
                    continue 
                else:
                    # Các lỗi khác mới thực sự dừng lại
                    print(f"❌ Lỗi kỹ thuật: {str(e)}")
                    break
        # Nếu đã thử hết MODEL_PRIORITY của Key hiện tại mà vẫn lỗi 429, đổi sang Key tiếp theo
        get_next_client_index()

    # Nếu chạy hết vòng lặp mà vẫn không được
    raise HTTPException(
        status_code=429, 
        detail="Bé Xoài đang bận phục vụ quá nhiều người. Thịnh đợi 1 phút rồi thử lại nha! 🥭"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)