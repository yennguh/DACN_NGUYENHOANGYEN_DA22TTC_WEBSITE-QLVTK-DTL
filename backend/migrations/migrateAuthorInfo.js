import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'QLVTK_DTL';

async function migrateAuthorInfo() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✓ Kết nối MongoDB thành công');

        const db = client.db(DB_NAME);
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        // Lấy tất cả posts
        const posts = await postsCollection.find({}).toArray();
        console.log(`\nTìm thấy ${posts.length} bài đăng`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const post of posts) {
            try {
                // Convert userId string to ObjectId để match với _id trong users
                let userId;
                try {
                    userId = new ObjectId(post.userId);
                } catch (e) {
                    // Nếu không phải ObjectId, giữ nguyên
                    userId = post.userId;
                }

                // Tìm user
                const user = await usersCollection.findOne({ _id: userId });

                if (user) {
                    const updateData = {};

                    // Chỉ cập nhật nếu chưa có hoặc khác với user hiện tại
                    if (!post.authorFullname || post.authorFullname !== user.fullname) {
                        updateData.authorFullname = user.fullname || '';
                    }

                    if (!post.authorAvatar || post.authorAvatar !== user.avatar) {
                        updateData.authorAvatar = user.avatar || '';
                    }

                    // Nếu có dữ liệu cần update
                    if (Object.keys(updateData).length > 0) {
                        await postsCollection.updateOne(
                            { _id: post._id },
                            { $set: updateData }
                        );
                        updatedCount++;
                        console.log(`✓ Cập nhật: ${post.title} (ID: ${post._id})`);
                    }
                } else {
                    console.warn(`⚠ Không tìm thấy user cho post: ${post.title} (userId: ${post.userId})`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`✗ Lỗi cập nhật post ${post._id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n=== KẾT QUẢ MIGRATION ===`);
        console.log(`Tổng bài đăng: ${posts.length}`);
        console.log(`Đã cập nhật: ${updatedCount}`);
        console.log(`Lỗi: ${errorCount}`);

        // Verify: Lấy một vài posts để kiểm tra
        const verifyPosts = await postsCollection.find({}).limit(3).toArray();
        console.log(`\n=== KIỂM TRA DỮ LIỆU ===`);
        verifyPosts.forEach(post => {
            console.log(`\nBài: ${post.title}`);
            console.log(`  - authorFullname: ${post.authorFullname || '(trống)'}`);
            console.log(`  - authorAvatar: ${post.authorAvatar || '(trống)'}`);
        });

        console.log(`\n✓ Migration hoàn thành!`);

    } catch (error) {
        console.error('Lỗi migration:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✓ Đóng kết nối MongoDB');
    }
}

migrateAuthorInfo();
