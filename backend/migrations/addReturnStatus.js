import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DATABASE_NAME || process.env.DB_NAME || 'QLVTK-DTL';

async function addReturnStatus() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    const db = client.db(DB_NAME);
    const posts = db.collection('posts');

    // Find posts in "lost" category
    const cursor = posts.find({ category: 'lost' });
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    while (await cursor.hasNext()) {
      const post = await cursor.next();
      try {
        const desired = (post.status === 'completed') ? 'gửi trả' : 'chưa tìm thấy';

        // If returnStatus already set and equals desired, skip
        if (post.returnStatus && post.returnStatus === desired) {
          skipped++;
          continue;
        }

        // Update post
        await posts.updateOne(
          { _id: post._id },
          { $set: { returnStatus: desired } }
        );
        updated++;
        console.log(`✓ Updated post ${post._id} -> returnStatus: ${desired}`);
      } catch (err) {
        console.error(`✗ Error updating post ${post._id}:`, err.message || err);
        errors++;
      }
    }

    console.log('\n=== Migration summary ===');
    console.log('Updated:', updated);
    console.log('Skipped (already set):', skipped);
    console.log('Errors:', errors);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('✓ MongoDB connection closed');
  }
}

if (require.main === module) {
  addReturnStatus();
}

export default addReturnStatus;
