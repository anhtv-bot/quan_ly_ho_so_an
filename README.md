# Quản Lý Hồ Sơ Án

Triển khai ứng dụng với 2 image riêng:

- `quanlyhosoan-be:latest` cho backend FastAPI
- `quanlyhosoan-fe:latest` cho frontend React/Vite chạy qua Nginx

Mô hình chạy trên server đã được tách làm 2 bước:

- `docker-compose.build.yml` chỉ dùng để build image
- `docker-compose.yml` chỉ dùng để chạy `up/down` từ image đã có

## Cấu hình

1. Sao chép file mẫu:
```bash
cp .env.example .env
```

2. Cập nhật `.env` nếu cần:
```env
PORT=8001
FRONTEND_PORT=3000
BE_IMAGE=quanlyhosoan-be:latest
FE_IMAGE=quanlyhosoan-fe:latest
VITE_API_BASE=http://localhost:8001
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Lưu ý:

- `PORT` là cổng backend ngoài máy host.
- `FRONTEND_PORT` là cổng frontend ngoài máy host.
- `BE_IMAGE` và `FE_IMAGE` là tên image được build và dùng khi chạy container.
- Nếu đổi `PORT`, hãy đổi luôn `VITE_API_BASE` cho đúng API URL mà frontend sẽ gọi khi build.
- `CORS_ALLOW_ORIGINS` là danh sách domain frontend được phép gọi backend, ngăn cách nhau bằng dấu phẩy.

## Build Image Trên Server

Build riêng image:

```bash
docker compose -f docker-compose.build.yml build
```

Ví dụ chạy bằng domain thật:

```env
PORT=8001
FRONTEND_PORT=3000
BE_IMAGE=quanlyhosoan-be:latest
FE_IMAGE=quanlyhosoan-fe:latest
VITE_API_BASE=https://quanlyhosoapi.chinhquyenai.vn
CORS_ALLOW_ORIGINS=https://quanlyhoso.chinhquyenai.vn
```

Sau khi build xong sẽ có:

- `quanlyhosoan-be:latest`
- `quanlyhosoan-fe:latest`

## Chạy Ứng Dụng

Chạy container từ image đã build:

```bash
docker compose up -d
```

Kiểm tra trạng thái:

```bash
docker compose ps
```

Xem log:

```bash
docker compose logs -f be
docker compose logs -f fe
```

## Quy Trình Deploy Gợi Ý

Khi có thay đổi code:

```bash
docker compose down
docker compose -f docker-compose.build.yml build
docker compose up -d
```

Nếu bạn thay đổi `VITE_API_BASE` hoặc `CORS_ALLOW_ORIGINS`, hãy build lại và khởi động lại backend/frontend để nhận cấu hình mới.

Nếu chỉ restart container mà không build lại:

```bash
docker compose up -d
```

## Truy cập

- Frontend: `http://localhost:3000` hoặc `http://localhost:${FRONTEND_PORT}`
- Backend API: `http://localhost:8001`
- Swagger docs: `http://localhost:8001/docs`

## Dừng Ứng Dụng

```bash
docker compose down
```

## Ghi chú

- Dữ liệu SQLite được lưu trong volume `db_data` tại `/app/data`.
- File upload được mount ra máy host tại `./uploads` và map vào `/app/backend/uploads` trong container.
- `docker-compose.yml` dùng `env_file: .env` để nạp toàn bộ biến từ file `.env` vào container khi chạy.
- Frontend và backend chạy ở 2 container riêng.
- `docker-compose.yml` không còn chứa phần `build`, nên phù hợp để chạy trên server sau khi image đã được build sẵn.
