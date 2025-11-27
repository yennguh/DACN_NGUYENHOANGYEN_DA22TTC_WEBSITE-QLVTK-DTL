import { StatusCodes } from "http-status-codes";
import { postServices } from "../services/postServices.js";
import { notificationServices } from "../services/notificationServices.js";
import { userServices } from "../services/userServices.js";


const createPost = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        // Fetch user info to capture avatar and fullname
        let authorAvatar = null;
        let authorFullname = null;
        try {
            const userInfo = await userServices.GetUserInfor(decoded._id);
            if (userInfo) {
                authorAvatar = userInfo.avatar || null;
                authorFullname = userInfo.fullname || null;
            }
        } catch (err) {
            console.error('Failed to fetch user info for post avatar:', err);
        }

        const payload = {
            ...req.body,
            userId: decoded._id,
            authorAvatar,
            authorFullname
        };
        const result = await postServices.createPost(payload);
        res.status(StatusCodes.CREATED).json({
            message: 'Post created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await postServices.getPostById(id);
        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getPosts = async (req, res, next) => {
    try {
        const params = req.query;
        const result = await postServices.getPosts(params);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getTopPosters = async (req, res, next) => {
    try {
        const { limit } = req.query;
        const result = await postServices.getTopPosters({ limit });

        return res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        // Check if post exists
        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        // Check if user is owner or admin
        if (post.userId !== decoded._id && !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to update this post' });
        }

        // Fetch user info to capture latest avatar and fullname
        let updatePayload = { ...req.body };
        try {
            const userInfo = await userServices.GetUserInfor(decoded._id);
            if (userInfo) {
                updatePayload.authorAvatar = userInfo.avatar || null;
                updatePayload.authorFullname = userInfo.fullname || null;
            }
        } catch (err) {
            console.error('Failed to fetch user info for post avatar update:', err);
        }

        const result = await postServices.updatePost(id, updatePayload);
        res.status(StatusCodes.OK).json({
            message: 'Post updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        // Check if post exists
        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        // Check if user is owner or admin
        if (post.userId !== decoded._id && !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to delete this post' });
        }

        const result = await postServices.deletePost(id);
        res.status(StatusCodes.OK).json({
            message: 'Post deleted successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const approvePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can approve posts' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        const result = await postServices.updatePost(id, { status: 'approved' });

        // Gửi thông báo cho người đăng nếu khác admin hiện tại
        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: 'Bài đăng đã được duyệt',
                    message: `Bài đăng "${post.title}" đã được duyệt thành công.`,
                    type: 'post_approved',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create approval notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Post approved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const rejectPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can reject posts' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        const result = await postServices.updatePost(id, { status: 'rejected' });

        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: 'Bài đăng bị từ chối',
                    message: `Bài đăng "${post.title}" đã bị từ chối. Vui lòng kiểm tra lại nội dung và gửi lại.`,
                    type: 'post_rejected',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create rejection notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Post rejected successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params; // post id
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) return res.status(401).json({ message: 'Unauthorized' });

        const post = await postServices.getPostById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const result = await postServices.toggleLike(id, decoded._id);

        // If the action resulted in a like added (user now in likes), create notification for post owner
        const updated = result?.value || result?.lastErrorObject ? result.value : result;
        // result might be findOneAndUpdate result which has .value
        const updatedDoc = result?.value || result;
        const likes = (updatedDoc && updatedDoc.likes) || [];
        const userLiked = likes.includes(decoded._id);

        if (userLiked && post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: 'Bài đăng được thích',
                    message: `${decoded.fullname || 'Một người dùng'} đã thích bài đăng của bạn: ${post.title}`,
                    type: 'system',
                    relatedId: id
                });
            } catch (notifyErr) {
                console.error('Failed to create like notification', notifyErr);
            }
        }

        return res.status(200).json({ message: 'Toggled like', data: updatedDoc });
    } catch (error) {
        next(error);
    }
};

export const postController = {
    createPost,
    getPostById,
    getPosts,
    getTopPosters,
    updatePost,
    deletePost,
    approvePost,
    rejectPost,
    toggleLike
};
