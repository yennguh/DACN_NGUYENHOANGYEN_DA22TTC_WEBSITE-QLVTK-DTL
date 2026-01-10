
import { jwtHelper } from "../config/jwt.js";

const debug = console.log.bind(console);

// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-tuanta.com-green-cat-a@";
let isAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = await jwtHelper.verifyToken(token, accessTokenSecret);
    req.jwtDecoded = decoded;
    return next();
  } catch (error) {
    debug("Error while verify token:", error);
    return res.status(401).json({ message: 'Unauthorized.' });
  }
}

// Optional auth - lấy user info nếu có token, không bắt buộc
let optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    req.jwtDecoded = null;
    return next();
  }
  try {
    const decoded = await jwtHelper.verifyToken(token, accessTokenSecret);
    req.jwtDecoded = decoded;
    return next();
  } catch (error) {
    // Token không hợp lệ nhưng vẫn cho phép tiếp tục
    req.jwtDecoded = null;
    return next();
  }
}

export { isAuth, optionalAuth };