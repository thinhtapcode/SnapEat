# Use python 3.11 slim variant as requested
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if required for native libraries (like Pillow, OpenCV, etc)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source files
COPY . .

EXPOSE 8000

# Start the FastAPI using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
