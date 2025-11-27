## 🗄️ HƯỚNG DẪN MIGRATION DỮ LIỆU MONGODB

### 📋 YÊU CẦU
- Node.js đã cài đặt
- MongoDB running và kết nối được
- File `.env` trong folder `backend/` có chứa `MONGODB_URI` và `DB_NAME`

### 🔧 STEP 1: KIỂM TRA DỮ LIỆU HIỆN TẠI

Chạy script verify để xem dữ liệu hiện tại:

```bash
cd backend
node migrations/verifyData.js
```

**Kết quả sẽ hiển thị:**
- Số posts có authorFullname
- Số posts thiếu authorFullname
- Mẫu posts từ database
- Danh sách users để verify

---

### 🚀 STEP 2: CHẠY MIGRATION

Chạy script migration để cập nhật tất cả posts:

```bash
cd backend
node migrations/migrateAuthorInfo.js
```

**Script sẽ:**
1. ✓ Kết nối MongoDB
2. ✓ Lấy tất cả posts
3. ✓ Với mỗi post, tìm user tương ứng
4. ✓ Cập nhật `authorFullname` từ `user.fullname`
5. ✓ Cập nhật `authorAvatar` từ `user.avatar`
6. ✓ Hiển thị tổng kết quả
7. ✓ Verify bằng cách hiển thị 3 posts đã cập nhật

---

### ✅ STEP 3: VERIFY KẾT QUẢ

Sau khi migration hoàn thành, chạy lại verify:

```bash
node migrations/verifyData.js
```

Kiểm tra xem tất cả posts đã có `authorFullname` và `authorAvatar`.

---

### 📊 EXPECTED OUTPUT

```
✓ Kết nối MongoDB thành công

Tìm thấy 12 bài đăng

✓ Cập nhật: Nhật được chia khóa nhà ở Công trường (ID: 507f1f77bcf86cd799439011)
✓ Cập nhật: Nhật được ốp lung ở Nhà xe khu 1 (ID: 507f1f77bcf86cd799439012)
...

=== KẾT QUẢ MIGRATION ===
Tổng bài đăng: 12
Đã cập nhật: 10
Lỗi: 0

✓ Migration hoàn thành!
```

---

### 🔍 VERIFY DỮ LIỆU TRONG MONGODB

Bạn cũng có thể verify trực tiếp trong MongoDB:

**MongoDB Compass hoặc Terminal:**

```javascript
// Lấy posts có authorFullname
db.posts.find({ authorFullname: { $exists: true } }).limit(5)

// Đếm posts có authorFullname
db.posts.countDocuments({ authorFullname: { $exists: true } })

// Hiển thị posts của một user cụ thể
db.posts.find({ userId: "user_id_here" }, { title: 1, authorFullname: 1 })
```

---

### ⚠️ TROUBLESHOOTING

**Lỗi: "Cannot connect to MongoDB"**
- Kiểm tra MongoDB đang running
- Kiểm tra MONGODB_URI trong `.env`

**Lỗi: "User not found"**
- Bài đăng có userId không khớp với ObjectId nào trong users collection
- Script sẽ skip bài này và báo lỗi

**Không cập nhật được posts nào**
- Kiểm tra xem posts collection có dữ liệu không
- Kiểm tra users collection có dữ liệu không

---

### 📝 LƯU Ý

- Migration script chỉ cập nhật những posts cần thiết (nếu đã có authorFullname, không cập nhật lại)
- Script không xóa bất kỳ dữ liệu nào, chỉ thêm/cập nhật
- Backup database trước khi chạy nếu cần

---

### 🎯 KẾT QUẢ CÓ THỂ MONG ĐỢI

Sau khi migration:
1. ✅ Tất cả posts sẽ có `authorFullname` từ user.fullname
2. ✅ Tất cả posts sẽ có `authorAvatar` từ user.avatar
3. ✅ Dashboard admin sẽ hiển thị tên người đăng
4. ✅ Danh sách posts sẽ hiển thị avatar người đăng
5. ✅ Trang "Danh sách đã trả" sẽ hiển thị tên người đăng

