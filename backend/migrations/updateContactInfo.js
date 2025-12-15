/**
 * Migration: Cập nhật thông tin liên hệ vào MongoDB
 * Chạy: node backend/migrations/updateContactInfo.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function updateContactInfo() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Đã kết nối MongoDB');
        
        const db = client.db(DATABASE_NAME);
        
        // Cập nhật hoặc tạo mới thông tin liên hệ trong collection settings
        const contactInfo = {
            type: 'contact',
            email: 'hoangyen24042004@gmail.com',
            hotline: '0986 095 484',
            address: '126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh',
            schoolName: 'Đại học Trà Vinh',
            website: 'https://tvu.edu.vn',
            studentPortal: 'https://sinhvien.tvu.edu.vn',
            updatedAt: new Date()
        };
        
        const result = await db.collection('settings').updateOne(
            { type: 'contact' },
            { $set: contactInfo },
            { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
            console.log('✅ Đã tạo mới thông tin liên hệ');
        } else if (result.modifiedCount > 0) {
            console.log('✅ Đã cập nhật thông tin liên hệ');
        } else {
            console.log('ℹ️ Thông tin liên hệ không thay đổi');
        }
        
        // Hiển thị thông tin đã lưu
        const saved = await db.collection('settings').findOne({ type: 'contact' });
        console.log('\n📋 Thông tin liên hệ hiện tại:');
        console.log(JSON.stringify(saved, null, 2));
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
}

updateContactInfo();
