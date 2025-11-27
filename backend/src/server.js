
import bodyParser from 'body-parser';
import express from 'express'
import { CONNECT_DB } from './config/mongodb.js'
import cors from 'cors'
import { errorHandlingMiddleware } from './middlewares/handleError.js'
import API from "./routes/index.js"
import { setupSwagger } from './config/swagger.js'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const START_SERVER = () => {
  const app = express()
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  // CORS configuration - cho phép nhiều origin để dễ deploy riêng biệt
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4200', 'http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002'];
  
  const corsOption = {
    credentials: true,
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như Postman, mobile apps)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }
  app.use(cors(corsOption));
  
  // Serve static files from public directory
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
  
  setupSwagger(app);
  const hostname = process.env.HOST || 'localhost'
  const port = process.env.PORT || 8017
  app.use('/v1', API)
  app.use(errorHandlingMiddleware)
  app.listen(port, hostname, () => {
    console.log(` I am running ok   ${hostname}:${port}/`)
  })
}
CONNECT_DB().then(
  console.log("conectDB"),
  START_SERVER()
).catch(error => {
  console.error(error)
  process.exit(0)
}
)

