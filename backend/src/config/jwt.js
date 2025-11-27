import jwt from "jsonwebtoken"
let generateToken = (user, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {
    // Định nghĩa những thông tin của user mà bạn muốn lưu vào token ở đây
    // Thực hiện ký và tạo token
    jwt.sign(
      {
        _id: user._id,
        email: user.email,
        roles: user.roles
      },
      secretSignature,
      {
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      });
  });
}

let generaterefresh = (user, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {
    // Định nghĩa những thông tin của user mà bạn muốn lưu vào token ở đây
    const userData = {
      _id: user._id,
      email: user.email,
    }
    // Thực hiện ký và tạo token
    jwt.sign(
      userData,
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      });
  });
}

let verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
}
export const jwtHelper = {
  generaterefresh,
  generateToken,
  verifyToken
}
// module.exports = {
//   generaterefresh: generaterefresh,
//   generateToken: generateToken,
//   verifyToken: verifyToken,
// };