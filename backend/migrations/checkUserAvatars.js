// Script kiểm tra avatar của users và contacts
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function checkUserAvatars() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        const usersCollection = db.collection('users');
        
        // Lấy tất cả users
        console.log('=== DANH SÁCH USERS ===');
        const users = await usersCollection.find({}).toArray();
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullname} (${user.email})`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Avatar: ${user.avatar || 'Không có'}`);
            console.log('');
        });
        
        // Lấy tất cả contacts và kiểm tra avatar
        console.log('\n=== KIỂM TRA CONTACTS ===');
        const contacts = await contactsCollection.find({}).toArray();
        
        for (const contact of contacts) {
            console.log(`\nContact: "${contact.subject}"`);
            console.log(`  Name trong contact: ${contact.name}`);
            console.log(`  Email trong contact: ${contact.email}`);
            console.log(`  UserId: ${contact.userId || 'N/A'}`);
            
            if (contact.userId) {
                try {
                    const user = await usersCollection.findOne({ 
                        _id: new ObjectId(contact.userId) 
                    });
                    if (user) {
                        console.log(`  => User tìm thấy: ${user.fullname} (${user.email})`);
                        console.log(`  => Avatar của user: ${user.avatar || 'Không có'}`);
                        
                        // Kiểm tra email có khớp không
                        if (user.email !== contact.email) {
                            console.log(`  ⚠️ EMAIL KHÔNG KHỚP! Contact email: ${contact.email}, User email: ${user.email}`);
                        }
                    } else {
                        console.log(`  ❌ Không tìm thấy user với ID: ${contact.userId}`);
                    }
                } catch (err) {
                    console.log(`  ❌ Lỗi khi tìm user: ${err.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

checkUserAvatars();
