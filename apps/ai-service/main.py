from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import io
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SnapEat AI Service",
    description="Food image recognition and analysis API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RecognizedFood(BaseModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    confidence: float
    servingSize: str = "100g"

class FoodRecognitionResponse(BaseModel):
    success: bool
    foods: List[RecognizedFood]
    confidence: float
    message: Optional[str] = None

class FoodRecognitionRequest(BaseModel):
    imageData: str  # base64 encoded image

# In-memory food database (simplified version)
# In production, this would be a proper database or API call to nutrition database
FOOD_DATABASE = {
    "chicken breast": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6},
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    "broccoli": {"calories": 55, "protein": 3.7, "carbs": 11, "fat": 0.6},
    "salmon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13},
    "apple": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2},
    "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3},
    "egg": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11},
    "bread": {"calories": 265, "protein": 9, "carbs": 49, "fat": 3.2},
    "pasta": {"calories": 131, "protein": 5, "carbs": 25, "fat": 1.1},
    "salad": {"calories": 33, "protein": 2.5, "carbs": 6.3, "fat": 0.4},
    "burger": {"calories": 295, "protein": 17, "carbs": 14, "fat": 14},
    "pizza": {"calories": 266, "protein": 11, "carbs": 33, "fat": 10},
    "steak": {"calories": 271, "protein": 25, "carbs": 0, "fat": 19},
}

def analyze_image(image: Image.Image) -> List[RecognizedFood]:
    """
    Analyze food image using AI model.
    This is a simplified version. In production, you would use a real
    computer vision model like YOLO, ResNet, or a food-specific model.
    """
    # Placeholder logic - returns random foods for demonstration
    # In production, this would use actual ML model inference
    import random
    
    # Simulate AI recognition by selecting 1-3 random foods
    num_foods = random.randint(1, 3)
    recognized_foods = []
    
    available_foods = list(FOOD_DATABASE.keys())
    selected_foods = random.sample(available_foods, min(num_foods, len(available_foods)))
    
    for food_name in selected_foods:
        nutrition = FOOD_DATABASE[food_name]
        confidence = random.uniform(0.7, 0.95)
        
        recognized_foods.append(RecognizedFood(
            name=food_name.title(),
            calories=nutrition["calories"],
            protein=nutrition["protein"],
            carbs=nutrition["carbs"],
            fat=nutrition["fat"],
            confidence=confidence,
            servingSize="100g"
        ))
    
    return recognized_foods

@app.get("/")
async def root():
    return {
        "message": "SnapEat AI Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/recognize", response_model=FoodRecognitionResponse)
async def recognize_food_base64(request: FoodRecognitionRequest):
    """
    Recognize food from base64 encoded image
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.imageData.split(',')[-1])
        image = Image.open(io.BytesIO(image_data))
        
        # Analyze image
        recognized_foods = analyze_image(image)
        
        if not recognized_foods:
            return FoodRecognitionResponse(
                success=False,
                foods=[],
                confidence=0.0,
                message="No food items recognized in the image"
            )
        
        # Calculate overall confidence
        avg_confidence = sum(f.confidence for f in recognized_foods) / len(recognized_foods)
        
        return FoodRecognitionResponse(
            success=True,
            foods=recognized_foods,
            confidence=avg_confidence,
            message=f"Recognized {len(recognized_foods)} food item(s)"
        )
        
    except Exception as e:
        logger.error(f"Error recognizing food: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.post("/api/recognize/upload", response_model=FoodRecognitionResponse)
async def recognize_food_upload(file: UploadFile = File(...)):
    """
    Recognize food from uploaded image file
    """
    try:
        # Read and open image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Analyze image
        recognized_foods = analyze_image(image)
        
        if not recognized_foods:
            return FoodRecognitionResponse(
                success=False,
                foods=[],
                confidence=0.0,
                message="No food items recognized in the image"
            )
        
        # Calculate overall confidence
        avg_confidence = sum(f.confidence for f in recognized_foods) / len(recognized_foods)
        
        return FoodRecognitionResponse(
            success=True,
            foods=recognized_foods,
            confidence=avg_confidence,
            message=f"Recognized {len(recognized_foods)} food item(s)"
        )
        
    except Exception as e:
        logger.error(f"Error recognizing food: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.get("/api/foods")
async def list_foods():
    """
    Get list of all foods in database
    """
    return {
        "foods": [
            {
                "name": name.title(),
                **nutrition,
                "servingSize": "100g"
            }
            for name, nutrition in FOOD_DATABASE.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
