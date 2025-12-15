/**
 * Kiểm tra các collection trong MongoDB
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function checkCollections() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Đã kết nối MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        
        // Lấy danh sách tất cả collections
        const collections = await db.listCollections().toArray();
        
        console.log('📦 Các collection hiện có trong database:', DATABASE_NAME);
        console.log('=' .repeat(50));
        
        if (collections.length === 0) {
            console.log('❌ Chưa có collection nào!');
        } else {
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  ✓ ${col.name.padEnd(20)} - ${count} documents`);
            }
        }
        
        // Kiểm tra các collection cần thiết
        console.log('\n📋 Kiểm tra các collection cần thiết:');
        console.log('=' .repeat(50));
        
        const requiredCollections = [
            'users',
            'posts', 
            'comments',
            'contacts',
            'notifications',
            'reports',
            'categories',
            'settings'
        ];
        
        const existingNames = collections.map(c => c.name);
        
        for (const name of requiredCollections) {
            if (existingNames.includes(name)) {
                const count = await db.collection(name).countDocuments();
                console.log(`  ✅ ${name.padEnd(20)} - Đã có (${count} documents)`);
            } else {
                console.log(`  ❌ ${name.padEnd(20)} - CHƯA CÓ`);
            }
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await client.close();
    }
}

checkCollections();
