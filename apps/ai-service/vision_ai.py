import json
from typing import List
from pydantic import BaseModel
from ultralytics import YOLO
import cv2

# =====================
# Load YOLOv8 model
# =====================
# ultralytics cung cấp yolov8n.pt (nano) pre-trained on food / coco
# bạn có thể fine-tune riêng cho món VN nếu muốn
model = YOLO("yolov8n.pt")  # model light, chạy CPU nhanh

# =====================
# Load local food library
# =====================
with open("food_library.json", "r", encoding="utf-8") as f:
    FoodLibrary = json.load(f)

# =====================
# Schemas
# =====================
class FoodPrediction(BaseModel):
    name: str
    confidence: float
    estimated_calories: int | str
    notes: str | None = None

class VisionResult(BaseModel):
    foods: List[FoodPrediction]

# =====================
# Functions
# =====================
def analyze_food_image(image_path: str) -> VisionResult:
    """
    Scan image → return dishes + estimated calories
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not found or invalid")

    results = model(img)[0]  # lấy kết quả YOLO
    foods = []

    for box in results.boxes:
        # label index → string
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])

        # YOLO class names (default coco.names)
        try:
            dish_name = results.names[cls_id]
        except:
            dish_name = "unknown"

        # Lookup calories
        calories = FoodLibrary.get(dish_name, {}).get("calories", "unknown")

        foods.append(FoodPrediction(
            name=dish_name,
            confidence=conf,
            estimated_calories=calories,
            notes="Detected by YOLOv8 offline"
        ))

    return VisionResult(foods=foods)

def analyze_food_text(dish_name: str) -> VisionResult:
    """
    Lookup calories from local DB
    """
    calories = FoodLibrary.get(dish_name, {}).get("calories", "unknown")
    return VisionResult(foods=[FoodPrediction(
        name=dish_name,
        confidence=1.0,
        estimated_calories=calories,
        notes="From local FoodLibrary"
    )])
