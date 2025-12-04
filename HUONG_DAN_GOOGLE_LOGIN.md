# Hướng dẫn cấu hình Đăng nhập Google

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Click vào dropdown project ở góc trên bên trái
3. Click "New Project"
4. Đặt tên project (ví dụ: "QLVTK-DTL")
5. Click "Create"

## Bước 2: Bật Google+ API

1. Trong Google Cloud Console, vào "APIs & Services" > "Library"
2. Tìm kiếm "Google+ API" hoặc "Google Identity"
3. Click vào và bật API

## Bước 3: Cấu hình OAuth Consent Screen

1. Vào "APIs & Services" > "OAuth consent screen"
2. Chọn "External" (cho phép tất cả người dùng Google)
3. Click "Create"
4. Điền thông tin:
   - App name: "Hệ thống quản lý vật thất lạc"
   - User support email: email của bạn
   - Developer contact: email của bạn
5. Click "Save and Continue"
6. Ở phần Scopes, click "Add or Remove Scopes"
7. Chọn: `email`, `profile`, `openid`
8. Click "Save and Continue"
9. Ở phần Test users, thêm email của bạn để test
10. Click "Save and Continue"

## Bước 4: Tạo OAuth Client ID

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Chọn Application type: "Web application"
4. Đặt tên: "QLVTK-DTL Web Client"
5. Thêm **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
6. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:8017/v1/auth/google/callback
   ```
7. Click "Create"
8. **Copy Client ID và Client Secret**

## Bước 5: Cập nhật file cấu hình

### Backend (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Frontend (`frontend/.env`):
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

## Bước 6: Khởi động lại ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Lưu ý quan trọng

- Client ID và Client Secret phải giống nhau ở cả frontend và backend
- Đảm bảo đã thêm đúng origins và redirect URIs
- Nếu gặp lỗi "redirect_uri_mismatch", kiểm tra lại Authorized redirect URIs
- Khi deploy lên production, cần thêm domain thật vào origins và redirect URIs

## Test đăng nhập

1. Mở http://localhost:3000/login
2. Click "Đăng nhập với Google"
3. Chọn tài khoản Google
4. Hệ thống sẽ tự động:
   - Tạo user mới trong MongoDB nếu chưa có
   - Hoặc đăng nhập nếu user đã tồn tại
5. Redirect về trang chủ sau khi đăng nhập thành công
