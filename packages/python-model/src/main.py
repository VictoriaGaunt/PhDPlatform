import os
from fastapi import FastAPI
from pymongo import MongoClient
import redis
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PhD Python Model", version="1.0.0")

# Глобальные переменные для клиентов БД (будут инициализированы при старте)
mongo_client = None
redis_client = None

@app.on_event("startup")
async def startup_event():
    global mongo_client, redis_client
    logger.info("Starting up Python model service...")

    # Подключение к MongoDB
    mongo_uri = os.getenv("MONGODB_URI")
    if mongo_uri:
        try:
            mongo_client = MongoClient(mongo_uri)
            # Проверка подключения
            mongo_client.admin.command('ping')
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            mongo_client = None
    else:
        logger.warning("MONGODB_URI not set, running without MongoDB")

    # Подключение к Redis
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            redis_client = redis.from_url(redis_url, decode_responses=True)
            redis_client.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            redis_client = None
    else:
        logger.warning("REDIS_URL not set, running without Redis")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down...")
    if mongo_client:
        mongo_client.close()
    if redis_client:
        redis_client.close()

@app.get("/")
async def root():
    return {
        "service": "PhD Python Model",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    db_status = "connected" if mongo_client else "disconnected"
    redis_status = "connected" if redis_client else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "redis": redis_status
    }

@app.get("/api/v1/test")
async def test():
    return {"message": "Python model is working"}

# заглушка
@app.post("/api/v1/predict")
async def predict(data: dict):
    # Здесь будет логика модели
    return {"prediction": "dummy", "input_received": data}

# Точка входа для запуска (используется, если файл запускается напрямую)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)