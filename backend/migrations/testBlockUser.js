// Script test chức năng chặn user
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function testBlockUser() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        const usersCollection = db.collection('users');
        
        // Hiển thị trạng thái contacts
        console.log('=== TRẠNG THÁI CONTACTS ===');
        const contacts = await contactsCollection.find({}).toArray();
        
        for (const contact of contacts) {
            console.log(`\n"${contact.subject}"`);
            console.log(`  UserId: ${contact.userId || 'N/A'}`);
            console.log(`  userBlocked: ${contact.userBlocked || false}`);
            console.log(`  hiddenForAdmin: ${contact.hiddenForAdmin || false}`);
            console.log(`  hiddenForUser: ${contact.hiddenForUser || false}`);
        }
        
        // Hiển thị trạng thái users
        console.log('\n\n=== TRẠNG THÁI USERS ===');
        const users = await usersCollection.find({}).toArray();
        
        for (const user of users) {
            console.log(`\n${user.fullname} (${user.email})`);
            console.log(`  ID: ${user._id}`);
            console.log(`  blockedFromContact: ${user.blockedFromContact || false}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\n\nDisconnected from MongoDB');
    }
}

testBlockUser();
