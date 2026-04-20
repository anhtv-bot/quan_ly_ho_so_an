# Quản Lý Hồ Sơ Án

Triển khai nhanh ứng dụng backend FastAPI và frontend React/Vite bằng Docker.

## Triển khai

1. Sao chép file cấu hình mẫu:
```bash
copy .env.example .env
```
2. Mở `.env` và điền giá trị:
```env
SUBDOMAIN=your-subdomain
PORT=8001
```
3. Khởi động ứng dụng:
```bash
docker compose up -d
```
4. Kiểm tra trạng thái:
```bash
docker compose ps
```

## Ghi chú

- Dữ liệu SQLite được lưu vào volume `db_data` và không bị mất khi restart.
- Ứng dụng backend lắng nghe tại cổng `8001`.
- Frontend đã được build sẵn và phục vụ bởi backend.

## File mới

- `Dockerfile` - Multi-stage build frontend + backend.
- `docker-compose.yml` - service app + persistent volume.
- `.env.example` - mẫu thông số SUBDOMAIN và PORT.

## Mở rộng

Nếu cần sửa `PORT`, chỉ cần cập nhật `.env` và chạy lại:
```bash
docker compose down

docker compose up -d
```
