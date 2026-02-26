FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build


FROM python:3.11-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
COPY app/requirements.txt app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app app
COPY alembic alembic
COPY alembic.ini alembic.ini

# Copy built frontend assets into the expected location for StaticFiles
COPY --from=frontend-build /frontend/dist frontend/dist

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

