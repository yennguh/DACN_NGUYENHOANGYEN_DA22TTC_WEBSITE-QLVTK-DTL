/**
 * Tạo settings school trong MongoDB
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function createSchoolSettings() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Đã kết nối MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        
        const schoolData = {
            type: 'school',
            name: 'Đại học Trà Vinh',
            nameEn: 'Tra Vinh University',
            shortName: 'TVU',
            address: '126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh',
            phone: '0986 095 484',
            email: 'hoangyen24042004@gmail.com',
            website: 'https://tvu.edu.vn',
            workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
            description: 'Hệ thống tìm đồ thất lạc Đại học Trà Vinh - Kênh thông tin tra cứu đồ bị mất của sinh viên và cán bộ.',
            updatedAt: new Date()
        };
        
        const result = await db.collection('settings').updateOne(
            { type: 'school' },
            { $set: schoolData },
            { upsert: true }
        );
        
        console.log('✅ Đã tạo/cập nhật settings school');
        console.log(JSON.stringify(schoolData, null, 2));
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
    }
}

createSchoolSettings();
