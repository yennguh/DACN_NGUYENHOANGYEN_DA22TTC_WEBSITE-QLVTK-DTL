// Script cập nhật userId cho các contacts dựa trên email
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://qlvtk-dtl:123456789Yen@qlvtk-dtl.k0w1awo.mongodb.net/?appName=qlvtk-dtl';
const DATABASE_NAME = 'QLVTK-DTL';

async function fixContactUserId() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(DATABASE_NAME);
        const contactsCollection = db.collection('contacts');
        const usersCollection = db.collection('users');
        
        // Lấy tất cả contacts không có userId
        const contactsWithoutUserId = await contactsCollection.find({
            $or: [
                { userId: null },
                { userId: { $exists: false } },
                { userId: '' }
            ]
        }).toArray();
        
        console.log(`\nTìm thấy ${contactsWithoutUserId.length} contacts không có userId`);
        
        let updatedCount = 0;
        
        for (const contact of contactsWithoutUserId) {
            // Tìm user theo email
            const user = await usersCollection.findOne({ email: contact.email });
            
            if (user) {
                await contactsCollection.updateOne(
                    { _id: contact._id },
                    { $set: { userId: user._id.toString() } }
                );
                console.log(`✓ Cập nhật contact "${contact.subject}" với userId: ${user._id}`);
                updatedCount++;
            } else {
                console.log(`✗ Không tìm thấy user với email: ${contact.email}`);
            }
        }
        
        console.log(`\nĐã cập nhật ${updatedCount}/${contactsWithoutUserId.length} contacts`);
        
        // Hiển thị lại tất cả contacts
        console.log('\n--- Danh sách contacts sau khi cập nhật ---');
        const allContacts = await contactsCollection.find({}).toArray();
        
        allContacts.forEach((contact, index) => {
            console.log(`\n${index + 1}. Subject: ${contact.subject}`);
            console.log(`   User: ${contact.name} (${contact.email})`);
            console.log(`   UserId: ${contact.userId || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

fixContactUserId();
