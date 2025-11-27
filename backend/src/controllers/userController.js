import { StatusCodes } from "http-status-codes";
import { jwtHelper } from "../config/jwt.js";
import { userServices } from "../services/userServices.js";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";
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
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token not provided or invalid.' });
        }

        // token payload uses `_id` when created in jwtHelper.generateToken
        const userId = decoded._id
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User id not found in token.' });
        }
        const user = await userServices.GetUserInfor(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found.' });
        }
        if (user) {
            let data = {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar || null,
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
            message: 'Refresh token is required'
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
            message: 'Invalid refresh token'
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
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        // Prepare update payload
        const updatePayload = { ...req.body };

        // If file is uploaded, add avatar path
        if (req.file) {
            // Construct the URL path to the uploaded file
            updatePayload.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // Check if there's anything to update
        if (Object.keys(updatePayload).length === 0 && !req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No fields provided for update' });
        }

        const updatedUser = await userServices.UpdateUser(decoded._id, updatePayload);

        if (!updatedUser) {
            return res.status(StatusCodes.OK).json({ message: 'User update successfully' });
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
            message: 'User updated successfully',
            data: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                roles: updatedUser.roles,
                avatar: updatedUser.avatar,
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
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
        }

        const result = await userServices.DeleteUser(id);
        
        return res.status(StatusCodes.OK).json({
            message: 'User deleted successfully',
            data: result
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
        }
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
    DeleteUser
}