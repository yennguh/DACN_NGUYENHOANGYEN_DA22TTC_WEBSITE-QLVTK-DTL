// Script cập nhật senderAvatar cho các reply cũ
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function fixReplyAvatars() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB\n');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        const usersCollection = db.collection('users');
        
        // Lấy tất cả contacts có replies
        const contacts = await contactsCollection.find({ 
            'replies.0': { $exists: true } 
        }).toArray();
        
        console.log(`Tìm thấy ${contacts.length} contacts có replies\n`);
        
        for (const contact of contacts) {
            let updated = false;
            const updatedReplies = [];
            
            for (const reply of contact.replies) {
                if (reply.senderId && !reply.senderAvatar) {
                    try {
                        const user = await usersCollection.findOne({ 
                            _id: new ObjectId(reply.senderId) 
                        });
                        if (user && user.avatar) {
                            reply.senderAvatar = user.avatar;
                            reply.senderName = user.fullname || reply.senderName;
                            updated = true;
                            console.log(`  ✓ Cập nhật avatar cho reply của ${user.fullname} trong "${contact.subject}"`);
                        }
                    } catch (err) {
                        // senderId không hợp lệ
                    }
                }
                updatedReplies.push(reply);
            }
            
            if (updated) {
                await contactsCollection.updateOne(
                    { _id: contact._id },
                    { $set: { replies: updatedReplies } }
                );
            }
        }
        
        console.log('\n✅ Hoàn thành cập nhật avatar cho replies!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

fixReplyAvatars();
