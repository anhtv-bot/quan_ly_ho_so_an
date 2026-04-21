# Hướng Dẫn Chạy Ứng Dụng Trên Local

## 📋 Yêu Cầu
- Python 3.8+
- Node.js 14+
- npm hoặc yarn

## 🚀 Cách Chạy

### 1. **Một lệnh duy nhất (Khuyên dùng)**
Chạy file `run_local.bat` để khởi động cả backend và frontend tự động:

```bash
run_local.bat
```

Hoặc chạy từ PowerShell:
```powershell
.\run_local.bat
```

**Kết quả:** 
- Backend sẽ chạy ở `http://localhost:8001`
- Frontend sẽ chạy ở `http://localhost:3000`
- API Documentation ở `http://localhost:8001/docs`

---

### 2. **Chạy Thủ Công (Tùy chọn)**

#### **Terminal 1 - Backend (Port 8001)**
```bash
cd backend
..\\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

#### **Terminal 2 - Frontend (Port 3000)**
```bash
cd frontend
npm run dev
```

---

## 🔌 Kiến Trúc Kết Nối

```
Frontend (React + Vite)              Backend (FastAPI)
   Port: 3000                          Port: 8001
   ↓                                    ↓
   apiConfig.js ──────────────────→ API Base: http://localhost:8001
   - GET  /cases/
   - POST /cases/
   - PUT  /cases/{id}
   - DELETE /cases/{id}
   - POST /upload-excel/
   - POST /upload-document/
   - GET  /statistics/
```

### Cấu Hình API

**Frontend** (`frontend/src/apiConfig.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001'
export default API_BASE
```

**Environment Variables** (`frontend/.env.local`):
```
VITE_API_BASE=http://localhost:8001
```

**Backend** (`backend/main.py`):
- CORS cho phép: `http://localhost:3000` ✓
- Chạy trên: `0.0.0.0:8001` ✓

---

## 📝 Các Endpoint Chính

### Quản Lý Vụ Án
- `GET /cases/` - Danh sách vụ án
- `GET /cases/{id}` - Chi tiết vụ án
- `POST /cases/` - Tạo vụ án
- `PUT /cases/{id}` - Cập nhật vụ án
- `DELETE /cases/{id}` - Xóa vụ án
- `POST /cases/bulk-delete` - Xóa hàng loạt

### Import Dữ Liệu
- `POST /upload-excel/` - Import file Excel
- `POST /upload-document/` - Đọc tài liệu (Word, PDF, Excel, CSV, TXT)

### Thống Kê
- `GET /statistics/` - Thống kê vụ án

### Documentation
- `GET /docs` - Swagger API Documentation (FastAPI)

---

## 🗄️ Cơ Sở Dữ Liệu

**Loại:** SQLite  
**Vị trí:** `./data/cases.db`  
**Tự động tạo:** ✓ (khi khởi động backend)

---

## ⚙️ Cấu Hình Thêm

### Tắt/Bật Reload Code
Trong `run_local.bat`, tìm dòng uvicorn:
```bash
# Có reload (tự load lại khi code thay đổi)
python -m uvicorn backend.main:app --reload

# Không reload (chỉ khởi động 1 lần)
python -m uvicorn backend.main:app
```

### Thay Đổi Port
Sửa trong `run_local.bat` hoặc các lệnh uvicorn:
```bash
--port 8000   # Đổi port backend
```

Trong `frontend/package.json`:
```json
"dev": "vite --port 4000"  // Đổi port frontend
```

---

## 🐛 Troubleshooting

### Lỗi: Port đang bị sử dụng
```bash
# Tìm và kill process sử dụng port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Hoặc dùng run_local.bat (tự động clear ports)
```

### Lỗi: Backend không kết nối
- Kiểm tra: `http://localhost:8001/docs` có hoạt động không
- Kiểm tra console backend có lỗi gì không
- Xem lại `CORS` trong `backend/main.py`

### Lỗi: Frontend không thấy dữ liệu
- Mở DevTools (F12) → Console
- Kiểm tra Network requests đến `/cases/`
- Xem response trả về có đúng không

---

## 📦 Cài Đặt Dependencies

### Backend
```bash
cd backend
..\\.venv\Scripts\pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## 🔐 Notes

- Database được lưu ở `data/cases.db`
- Upload files được lưu ở `backend/uploads/`
- Hot reload được bật mặc định (code thay đổi → tự reload)

---

**Chúc bạn code vui vẻ! 🎉**
