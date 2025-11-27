import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';

// Replace the uri string with your connection string.
// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

const uri = process.env.MONGODB_URI;
const database_name = process.env.DATABASE_NAME;
const mongoClientInstance = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
// Kết nối tới Database
export const CONNECT_DB = async () => {
    // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
    await mongoClientInstance.connect()

    // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên của chúng ta
    trelloDatabaseInstance = mongoClientInstance.db(database_name)
}

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
    await mongoClientInstance.close()
}

// Function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
    if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
    return trelloDatabaseInstance
}