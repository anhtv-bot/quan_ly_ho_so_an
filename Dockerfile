# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend .
RUN npm run build

# Build backend image and copy frontend build into Flask static folder
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY cases.json ./cases.json
COPY --from=frontend-builder /app/frontend/dist ./backend/static

EXPOSE 10000
ENV PORT=10000
CMD gunicorn --bind 0.0.0.0:$PORT backend.app_simple:app --workers 2 --threads 4
