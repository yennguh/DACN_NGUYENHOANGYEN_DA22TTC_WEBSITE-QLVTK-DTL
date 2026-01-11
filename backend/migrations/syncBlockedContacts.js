// Script đồng bộ trạng thái blocked giữa users và contacts
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function syncBlockedContacts() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        const usersCollection = db.collection('users');
        
        // Lấy tất cả users bị chặn
        const blockedUsers = await usersCollection.find({ blockedFromContact: true }).toArray();
        console.log(`Tìm thấy ${blockedUsers.length} users bị chặn\n`);
        
        for (const user of blockedUsers) {
            console.log(`Đồng bộ contacts của: ${user.fullname} (${user.email})`);
            
            // Cập nhật tất cả contacts của user này
            const result = await contactsCollection.updateMany(
                { userId: user._id.toString() },
                { $set: { userBlocked: true } }
            );
            
            console.log(`  => Đã cập nhật ${result.modifiedCount} contacts\n`);
        }
        
        // Hiển thị kết quả
        console.log('\n=== KẾT QUẢ SAU KHI ĐỒNG BỘ ===');
        const contacts = await contactsCollection.find({}).toArray();
        
        for (const contact of contacts) {
            console.log(`\n"${contact.subject}"`);
            console.log(`  userBlocked: ${contact.userBlocked || false}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\n\nDisconnected from MongoDB');
    }
}

syncBlockedContacts();
