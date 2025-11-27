// 📝 SCRIPT MIGRATION MONGODB TRỰC TIẾP
// Chạy trực tiếp trong MongoDB Shell hoặc MongoDB Compass

// ============================================
// STEP 1: VERIFY DỮ LIỆU HIỆN TẠI
// ============================================

// Đếm posts
db.posts.countDocuments({})

// Đếm posts có authorFullname
db.posts.countDocuments({ authorFullname: { $exists: true, $ne: '' } })

// Lấy mẫu posts
db.posts.find({}).limit(3).pretty()

// ============================================
// STEP 2: UPDATE POSTS VỚI AUTHOR INFO
// ============================================

// Lấy tất cả posts
const posts = db.posts.find({}).toArray();

let updated = 0;
let errors = 0;

posts.forEach(post => {
    try {
        // Tìm user dựa vào userId
        const user = db.users.findOne({ 
            _id: ObjectId(post.userId) 
        });

        if (user) {
            // Update post với authorFullname và authorAvatar
            db.posts.updateOne(
                { _id: post._id },
                {
                    $set: {
                        authorFullname: user.fullname || '',
                        authorAvatar: user.avatar || ''
                    }
                }
            );
            updated++;
            print("✓ Updated: " + post.title);
        } else {
            print("⚠ User not found for post: " + post.title);
            errors++;
        }
    } catch (error) {
        print("✗ Error on post " + post._id + ": " + error);
        errors++;
    }
});

print("\n=== MIGRATION RESULT ===");
print("Updated: " + updated);
print("Errors: " + errors);

// ============================================
// STEP 3: VERIFY RESULTS
// ============================================

// Kiểm tra posts đã được update
db.posts.find({ authorFullname: { $exists: true } }).limit(3).pretty()

// Đếm posts có authorFullname bây giờ
db.posts.countDocuments({ authorFullname: { $exists: true, $ne: '' } })

// ============================================
// ALTERNATIVE: BULK UPDATE (NHANH HƠN)
// ============================================

// Nếu muốn dùng aggregation + bulk update (nhanh hơn với large datasets)

db.posts.updateMany(
    {},
    [
        {
            $lookup: {
                from: "users",
                let: { userId: { $toObjectId: "$userId" } },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }
                ],
                as: "userInfo"
            }
        },
        {
            $set: {
                authorFullname: { 
                    $arrayElemAt: ["$userInfo.fullname", 0] 
                },
                authorAvatar: { 
                    $arrayElemAt: ["$userInfo.avatar", 0] 
                }
            }
        },
        {
            $unset: "userInfo"
        }
    ]
);

print("Bulk update completed!");

// Verify
db.posts.find({}, { title: 1, authorFullname: 1, authorAvatar: 1 }).limit(5).pretty()
