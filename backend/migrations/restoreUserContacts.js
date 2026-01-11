// Script khôi phục tất cả tin nhắn của user (bỏ hiddenForUser, hiddenForAdmin)
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function restoreUserContacts() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        
        // Khôi phục tất cả tin nhắn bị ẩn
        const result = await contactsCollection.updateMany(
            {
                $or: [
                    { hiddenForUser: true },
                    { hiddenForAdmin: true }
                ]
            },
            {
                $set: {
                    hiddenForUser: false,
                    hiddenForAdmin: false
                }
            }
        );
        
        console.log(`Đã khôi phục ${result.modifiedCount} tin nhắn`);
        
        // Hiển thị tất cả contacts
        const allContacts = await contactsCollection.find({}).toArray();
        console.log(`\nTổng số tin nhắn: ${allContacts.length}`);
        
        allContacts.forEach((contact, index) => {
            console.log(`\n${index + 1}. Subject: ${contact.subject}`);
            console.log(`   User: ${contact.name} (${contact.email})`);
            console.log(`   UserId: ${contact.userId || 'N/A'}`);
            console.log(`   HiddenForUser: ${contact.hiddenForUser || false}`);
            console.log(`   HiddenForAdmin: ${contact.hiddenForAdmin || false}`);
            console.log(`   Replies: ${contact.replies?.length || 0}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

restoreUserContacts();
