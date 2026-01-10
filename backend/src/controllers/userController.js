import { StatusCodes } from "http-status-codes";
import { jwtHelper } from "../config/jwt.js";
import { userServices } from "../services/userServices.js";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
// Thời gian sống của token
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "240hr";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-token-secret-example-tuanta.com-green-cat-a@";

// Thời gian sống của refreshToken
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "240hr";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-tuandev-green-cat-a@";
const CreatedUser = async (req, res, next) => {
    try {

        const repon = await userServices.CreatedUser(req.body)
        res.status(StatusCodes.OK).json(repon)

    } catch (error) {
        next(error)
    }
}

const InfoUser = async (req, res, next) => {
    try {
        // `isAuth` middleware sets `req.jwtDecoded` after verifying the token
        const decoded = req.jwtDecoded;
        if (!decoded) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        // token payload uses `_id` when created in jwtHelper.generateToken
        const userId = decoded._id
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không tìm thấy ID người dùng trong token' });
        }
        const user = await userServices.GetUserInfor(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }
        if (user) {
            let data = {
                _id: userId, // Thêm _id để frontend có thể fetch bài đăng của user
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar || null,
                coverPhoto: user.coverPhoto || null,
                createdAt: user.createdAt || null,
            }
            return res.status(StatusCodes.OK).json(data);
        }

    } catch (error) {
        return res.status(StatusCodes.NOT_FOUND)
    }
}
const Login = async (req, res, next) => {
    try {
        const repon = await userServices.Login_User(req.body)
        if (repon) {
            const accessToken = await jwtHelper.generateToken(repon, accessTokenSecret, accessTokenLife);
            const refreshToken = await jwtHelper.generaterefresh(repon, refreshTokenSecret, refreshTokenLife);
            return res.status(StatusCodes.OK).json({
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        }
        res.status(StatusCodes.OK).json({ status: 0, error: "Not found user" })

    } catch (error) {
        return res.status(StatusCodes.NOT_FOUND)
    }
}
const refreshToken = async (req, res) => {
    // Get refresh token from request
    const { refreshToken: token } = req.body;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Yêu cầu refresh token'
        });
    }

    try {
        // Verify refresh token
        const decoded = await jwtHelper.verifyToken(token, refreshTokenSecret);

        // Generate new access token
        const accessToken = await jwtHelper.generateToken(decoded, accessTokenSecret, accessTokenLife);

        return res.status(StatusCodes.OK).json({
            accessToken
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Refresh token không hợp lệ'
        });
    }
}

const ListUsers = async (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder } = req.query;
        const result = await userServices.ListUsers({
            page,
            limit,
            sortBy,
            sortOrder: sortOrder === 'asc' ? 1 : -1
        });
        
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
}

const UpdateUser = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập' });
        }

        // Prepare update payload
        const updatePayload = { ...req.body };

        // If files are uploaded, add paths
        if (req.files) {
            if (req.files.avatar && req.files.avatar[0]) {
                updatePayload.avatar = `/uploads/images/${req.files.avatar[0].filename}`;
            }
            if (req.files.coverPhoto && req.files.coverPhoto[0]) {
                updatePayload.coverPhoto = `/uploads/images/${req.files.coverPhoto[0].filename}`;
            }
        } else if (req.file) {
            // Fallback for single file upload
            updatePayload.avatar = `/uploads/images/${req.file.filename}`;
        }

        // Check if there's anything to update
        if (Object.keys(updatePayload).length === 0 && !req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không có thông tin nào để cập nhật' });
        }

        const updatedUser = await userServices.UpdateUser(decoded._id, updatePayload);

        if (!updatedUser) {
            return res.status(StatusCodes.OK).json({ message: 'Cập nhật thông tin thành công' });
        }

        // Also update posts author snapshot so existing posts reflect latest avatar/fullname
        try {
            if (updatedUser && updatedUser.avatar) {
                await GET_DB()
                    .collection('posts')
                    .updateMany(
                        { userId: decoded._id },
                        {
                            $set: {
                                author: {
                                    _id: new ObjectId(decoded._id),
                                    fullname: updatedUser.fullname,
                                    avatar: updatedUser.avatar
                                }
                            }
                        }
                    );
            } else if (updatedUser) {
                // still update fullname if avatar removed/changed
                await GET_DB()
                    .collection('posts')
                    .updateMany(
                        { userId: decoded._id },
                        {
                            $set: {
                                'author.fullname': updatedUser.fullname,
                                'author.avatar': updatedUser.avatar || null
                            }
                        }
                    );
            }
        } catch (err) {
            console.error('Failed to update posts author snapshot:', err);
            // don't fail the user update if this part errors
        }

        return res.status(StatusCodes.OK).json({
            message: 'Cập nhật thông tin thành công',
            data: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                roles: updatedUser.roles,
                avatar: updatedUser.avatar,
                coverPhoto: updatedUser.coverPhoto,
                updateAt: updatedUser.updateAt
            }
        });
    } catch (error) {
        next(error);
    }
}

const DeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Yêu cầu ID người dùng' });
        }

        const result = await userServices.DeleteUser(id);
        
        return res.status(StatusCodes.OK).json({
            message: 'Xóa người dùng thành công',
            data: result
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
        }
        next(error);
    }
}

const GoogleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Yêu cầu thông tin đăng nhập Google' });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await userServices.GetUserByEmail(email);
        
        if (!user) {
            // Create new user with Google info
            const newUserData = {
                email,
                fullname: name,
                avatar: picture,
                googleId,
                password: null, // No password for Google users
                roles: ['user'],
                phone: ''
            };
            await userServices.CreatedUserGoogle(newUserData);
            user = await userServices.GetUserByEmail(email);
        } else {
            // Update Google info if needed
            if (!user.googleId) {
                await userServices.UpdateUserGoogleId(user._id, googleId, picture);
            }
        }

        // Generate tokens
        const tokenPayload = {
            _id: user._id.toString(),
            email: user.email,
            fullname: user.fullname,
            roles: user.roles
        };
        
        const accessToken = await jwtHelper.generateToken(tokenPayload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generaterefresh(tokenPayload, refreshTokenSecret, refreshTokenLife);

        return res.status(StatusCodes.OK).json({
            accessToken,
            refreshToken,
            user: {
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
            message: 'Đăng nhập Google thất bại',
            error: error.message 
        });
    }
}

const GetUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Yêu cầu ID người dùng' });
        }

        const user = await userServices.GetUserInfor(id);
        
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }

        // Trả về thông tin công khai của user (không bao gồm password, email nhạy cảm)
        return res.status(StatusCodes.OK).json({
            _id: user._id,
            fullname: user.fullname,
            avatar: user.avatar || null,
            coverPhoto: user.coverPhoto || null,
            createdAt: user.createdAt || null,
        });
    } catch (error) {
        console.error('Get user by id error:', error);
        next(error);
    }
}

// Xác thực email và số điện thoại để reset password
const VerifyReset = async (req, res, next) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Vui lòng nhập đầy đủ email và số điện thoại' 
            });
        }

        // Tìm user với email và phone khớp
        const user = await GET_DB().collection('users').findOne({ 
            email: email,
            phone: phone 
        });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: 'Email hoặc số điện thoại không đúng!' 
            });
        }

        // Kiểm tra nếu là tài khoản Google
        if (!user.password && user.googleId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Tài khoản này đăng nhập bằng Google, không thể đặt lại mật khẩu' 
            });
        }

        return res.status(StatusCodes.OK).json({ 
            success: true,
            message: 'Xác thực thành công' 
        });
    } catch (error) {
        console.error('Verify reset error:', error);
        next(error);
    }
}

// Đặt lại mật khẩu mới
const ResetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Vui lòng nhập đầy đủ thông tin' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Tìm user
        const user = await GET_DB().collection('users').findOne({ email: email });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: 'Không tìm thấy tài khoản' 
            });
        }

        // Cập nhật mật khẩu
        await GET_DB().collection('users').updateOne(
            { email: email },
            { 
                $set: { 
                    password: newPassword,
                    updateAt: Date.now()
                } 
            }
        );

        return res.status(StatusCodes.OK).json({ 
            success: true,
            message: 'Đặt lại mật khẩu thành công' 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        next(error);
    }
}

const ChangePassword = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Get current user
        const user = await GET_DB().collection('users').findOne({ _id: new ObjectId(decoded._id) });
        
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }

        // Check if user logged in with Google (no password)
        if (!user.password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Tài khoản đăng nhập bằng Google không thể đổi mật khẩu' 
            });
        }

        // Verify current password
        if (user.password !== currentPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }

        // Update password
        await GET_DB().collection('users').updateOne(
            { _id: new ObjectId(decoded._id) },
            { 
                $set: { 
                    password: newPassword,
                    updateAt: Date.now()
                } 
            }
        );

        return res.status(StatusCodes.OK).json({ 
            message: 'Đổi mật khẩu thành công' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        next(error);
    }
}

// Chặn user khỏi tính năng liên hệ (Admin only)
const BlockUserFromContact = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Chỉ admin mới có quyền chặn người dùng' });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Yêu cầu ID người dùng' });
        }

        const result = await userServices.BlockUserFromContact(id);
        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }

        // Đánh dấu tất cả tin nhắn của user này là bị chặn
        const { contactServices } = await import('../services/contactServices.js');
        await contactServices.markUserContactsBlocked(id);

        return res.status(StatusCodes.OK).json({
            message: 'Đã chặn người dùng khỏi tính năng liên hệ',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Bỏ chặn user (Admin only)
const UnblockUserFromContact = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Chỉ admin mới có quyền bỏ chặn người dùng' });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Yêu cầu ID người dùng' });
        }

        const result = await userServices.UnblockUserFromContact(id);
        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }

        // Bỏ đánh dấu chặn cho tất cả tin nhắn của user này
        const { contactServices } = await import('../services/contactServices.js');
        await contactServices.unmarkUserContactsBlocked(id);

        return res.status(StatusCodes.OK).json({
            message: 'Đã bỏ chặn người dùng',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Lấy danh sách user bị chặn (Admin only)
const GetBlockedUsers = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Chỉ admin mới có quyền xem danh sách này' });
        }

        const result = await userServices.GetBlockedUsers();
        return res.status(StatusCodes.OK).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Kiểm tra user có bị chặn không
const CheckUserBlocked = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const user = await userServices.GetUserInfor(decoded._id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
        }

        return res.status(StatusCodes.OK).json({
            blocked: user.blockedFromContact === true
        });
    } catch (error) {
        next(error);
    }
}

export const userController = {
    CreatedUser,
    Login,
    InfoUser,
    refreshToken,
    ListUsers,
    UpdateUser,
    DeleteUser,
    GoogleLogin,
    ChangePassword,
    GetUserById,
    VerifyReset,
    ResetPassword,
    BlockUserFromContact,
    UnblockUserFromContact,
    GetBlockedUsers,
    CheckUserBlocked
}