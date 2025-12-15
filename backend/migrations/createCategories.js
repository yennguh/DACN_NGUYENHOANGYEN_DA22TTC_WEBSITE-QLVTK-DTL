/**
 * Tạo collection categories với dữ liệu mẫu
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function createCategories() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Đã kết nối MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        
        // Danh sách danh mục đồ vật
        const categories = [
            { name: 'Điện thoại', icon: '📱', description: 'Điện thoại di động các loại', order: 1, isActive: true, createdAt: new Date() },
            { name: 'Laptop', icon: '💻', description: 'Máy tính xách tay', order: 2, isActive: true, createdAt: new Date() },
            { name: 'Ví/Bóp', icon: '👛', description: 'Ví tiền, bóp da', order: 3, isActive: true, createdAt: new Date() },
            { name: 'Chìa khóa', icon: '🔑', description: 'Chìa khóa xe, nhà, phòng', order: 4, isActive: true, createdAt: new Date() },
            { name: 'Thẻ/Giấy tờ', icon: '🪪', description: 'CCCD, thẻ sinh viên, bằng lái', order: 5, isActive: true, createdAt: new Date() },
            { name: 'Sách vở', icon: '📚', description: 'Sách, vở, tài liệu học tập', order: 6, isActive: true, createdAt: new Date() },
            { name: 'Túi xách', icon: '👜', description: 'Túi xách, ba lô, cặp sách', order: 7, isActive: true, createdAt: new Date() },
            { name: 'Đồng hồ', icon: '⌚', description: 'Đồng hồ đeo tay', order: 8, isActive: true, createdAt: new Date() },
            { name: 'Tai nghe', icon: '🎧', description: 'Tai nghe có dây, không dây', order: 9, isActive: true, createdAt: new Date() },
            { name: 'Kính mắt', icon: '👓', description: 'Kính cận, kính râm', order: 10, isActive: true, createdAt: new Date() },
            { name: 'Quần áo', icon: '👕', description: 'Quần áo, giày dép', order: 11, isActive: true, createdAt: new Date() },
            { name: 'Trang sức', icon: '💍', description: 'Nhẫn, dây chuyền, vòng tay', order: 12, isActive: true, createdAt: new Date() },
            { name: 'Dụng cụ học tập', icon: '✏️', description: 'Bút, thước, máy tính cầm tay', order: 13, isActive: true, createdAt: new Date() },
            { name: 'Thiết bị điện tử', icon: '🔌', description: 'Sạc, cáp, USB, ổ cứng', order: 14, isActive: true, createdAt: new Date() },
            { name: 'Khác', icon: '📦', description: 'Các đồ vật khác', order: 99, isActive: true, createdAt: new Date() }
        ];
        
        // Xóa collection cũ nếu có và tạo mới
        const collections = await db.listCollections({ name: 'categories' }).toArray();
        if (collections.length > 0) {
            console.log('⚠️ Collection categories đã tồn tại, đang cập nhật...');
        }
        
        // Insert các danh mục
        const result = await db.collection('categories').insertMany(categories);
        
        console.log(`✅ Đã tạo ${result.insertedCount} danh mục trong collection 'categories'\n`);
        
        // Hiển thị danh sách
        console.log('📋 Danh sách danh mục:');
        console.log('=' .repeat(50));
        for (const cat of categories) {
            console.log(`  ${cat.icon} ${cat.name}`);
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
}

createCategories();
