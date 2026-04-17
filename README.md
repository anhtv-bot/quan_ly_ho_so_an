# Quản Lý Hồ Sơ Án - Case Management System

A professional case management system for judges to manage legal cases with workflow tracking and deadline monitoring.

## Features

### Backend (FastAPI)
- SQLite database with case management
- Workflow states: Hòa giải thành, Xét xử, Đình chỉ, Tạm đình chỉ, Bản án
- Automatic deadline calculation (3 months for KDTM cases, 6 months for others)
- Warning system: Yellow (<15 days), Red (overdue)
- Excel import functionality (.xlsx)
- REST API endpoints

### Frontend (React + Tailwind CSS)
- Login page (admin/admin123)
- Dashboard with case statistics
- Interactive case table with status updates
- Color-coded warnings for deadlines
- Add new cases form
- Upload Excel files
- Responsive design

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## API Endpoints

- `GET /cases/` - List all cases
- `POST /cases/` - Create new case
- `PUT /cases/{id}` - Update case status
- `POST /upload-excel/` - Import cases from Excel (.xlsx)
- `GET /statistics/` - Get case statistics

## Database Schema

Cases table:
- id (Primary Key)
- stt
- bien_lai_an_phi
- so_thu_ly (Unique)
- ngay_thu_ly
- ten_duong_su
- quan_he_tranh_chap
- loai_an (Dân sự, Hôn nhân, KDTM, Lao động, Hình sự, Cai nghiện)
- trang_thai (Hòa giải thành, Xét xử, Đình chỉ, Tạm đình chỉ, Bản án)
- han_giai_quyet (Auto-calculated)

## Deploy

### Deploy to Render

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Render will use the repository root `Dockerfile` to build both frontend and backend together.
4. Build command: leave blank (Dockerfile build is automatic).
5. Start command: leave blank (Render will use the Docker image CMD).
6. Environment: no custom env needed for the app itself; Render provides `$PORT`.

### Notes

- The app now serves the built React frontend from Flask via `backend.app_simple.py`.
- API calls use relative paths, so the same origin works on `https://quanlyhosoan.onrender.com`.
- There is no hard-coded local host or fixed port in deployment configuration.

### Option 2: Standalone Executable (.exe)

1. Install PyInstaller:
```bash
pip install -r requirements_exe.txt
```

2. Create executable:
```bash
pyinstaller --onefile --windowed backend/main.py --name quan-ly-ho-so-an
```

3. The .exe file will be in `dist/` folder. Share this file with customers - they can run it without installing anything.

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.12
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t case-management .
docker run -p 8000:8000 case-management
```

## Usage

1. Login with admin/admin123
2. Upload Excel file with case data
3. Add individual cases manually
4. Update case statuses as they progress
5. Monitor deadlines on the dashboard

## Excel Format

Columns (in order, STT is optional - will auto-increment if missing):
- STT (optional)
- Biên lai án phí
- Số thụ lý
- Ngày thụ lý (YYYY-MM-DD)
- Tên đương sự
- Quan hệ tranh chấp
- Loại án
- Trạng thái (optional, defaults to "Hòa giải thành")
- ngay_thu_ly (DateTime)
- duong_su (String)
- loai_an (String)
- trang_thai (String)
- han_giai_quyet (DateTime)