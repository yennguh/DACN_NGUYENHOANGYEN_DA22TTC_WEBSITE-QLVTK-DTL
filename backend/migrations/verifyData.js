import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'QLVTK_DTL';

async function verifyData() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✓ Kết nối MongoDB thành công\n');

        const db = client.db(DB_NAME);
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        // 1. Đếm posts có authorFullname
        const postsWithAuthor = await postsCollection.countDocuments({
            authorFullname: { $exists: true, $ne: '' }
        });

        const postsWithoutAuthor = await postsCollection.countDocuments({
            $or: [
                { authorFullname: { $exists: false } },
                { authorFullname: '' }
            ]
        });

        console.log('=== THỐNG KÊ POSTS ===');
        console.log(`Có authorFullname: ${postsWithAuthor}`);
        console.log(`Thiếu authorFullname: ${postsWithoutAuthor}`);
        console.log(`Tổng posts: ${postsWithAuthor + postsWithoutAuthor}\n`);

        // 2. Hiển thị một vài posts mẫu
        console.log('=== POSTS MẪU ===');
        const samplePosts = await postsCollection.find({}).limit(5).toArray();
        samplePosts.forEach((post, idx) => {
            console.log(`\n${idx + 1}. ${post.title}`);
            console.log(`   ID: ${post._id}`);
            console.log(`   userId: ${post.userId}`);
            console.log(`   authorFullname: ${post.authorFullname || '(trống)'}`);
            console.log(`   authorAvatar: ${post.authorAvatar || '(trống)'}`);
            console.log(`   status: ${post.status}`);
        });

        // 3. Hiển thị users
        console.log(`\n=== USERS TRONG DATABASE ===`);
        const users = await usersCollection.find({}).limit(5).toArray();
        users.forEach((user, idx) => {
            console.log(`\n${idx + 1}. ${user.fullname}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Avatar: ${user.avatar || '(không có)'}`);
        });

    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

verifyData();
