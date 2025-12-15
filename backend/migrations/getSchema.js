/**
 * Lấy cấu trúc schema từ MongoDB
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function getSchema() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(DATABASE_NAME);
        
        const collections = ['users', 'posts', 'comments', 'contacts', 'notifications', 'reports', 'categories', 'settings'];
        
        for (const colName of collections) {
            console.log(`\n=== ${colName.toUpperCase()} ===`);
            const doc = await db.collection(colName).findOne();
            if (doc) {
                console.log(JSON.stringify(doc, null, 2));
            } else {
                console.log('(empty)');
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

getSchema();
