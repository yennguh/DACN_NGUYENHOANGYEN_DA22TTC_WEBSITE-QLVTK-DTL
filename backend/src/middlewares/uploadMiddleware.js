import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục chung lưu tất cả ảnh
const imagesDir = path.join(__dirname, '../../public/uploads/images/');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'));
    }
};

// Storage chung - tất cả ảnh lưu vào /uploads/images/
const createStorage = (prefix) => multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, prefix + '-' + uniqueSuffix + ext);
    }
});

// Configure multer cho từng loại với prefix khác nhau
const uploadAvatarMulter = multer({
    storage: createStorage('avatar'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

const uploadCommentMulter = multer({
    storage: createStorage('comment'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

const uploadContactMulter = multer({
    storage: createStorage('contact'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

const uploadPostMulter = multer({
    storage: createStorage('post'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Storage cho profile (avatar + cover) - cùng thư mục images
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'avatar' ? 'avatar' : 'cover';
        cb(null, prefix + '-' + uniqueSuffix + ext);
    }
});

const uploadProfileMulter = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

export const uploadAvatar = uploadAvatarMulter.single('avatar');
export const uploadCommentImage = uploadCommentMulter.single('image');
export const uploadContactImage = uploadContactMulter.single('image');
export const uploadPostImages = uploadPostMulter.array('images', 10);
export const uploadProfile = uploadProfileMulter.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]);
