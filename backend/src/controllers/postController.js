import { StatusCodes } from "http-status-codes";
import { postServices } from "../services/postServices.js";
import { notificationServices } from "../services/notificationServices.js";
import { userServices } from "../services/userServices.js";


const createPost = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập' });
        }

        const isAdmin = decoded.roles?.includes('admin') || false;

        // Xử lý ảnh upload
        let images = [];
        if (req.files && req.files.length > 0) {
            // Ảnh được upload qua multer
            images = req.files.map(file => `/uploads/images/${file.filename}`);
        } else if (req.body.images) {
            // Ảnh dạng Base64 hoặc URL (fallback)
            images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        let payload = {
            ...req.body,
            images: images,
            userId: decoded._id,
            // Admin đăng bài trực tiếp được duyệt, user thường phải chờ duyệt
            status: isAdmin ? (req.body.status || 'approved') : 'pending',
            isAdminPost: isAdmin // Đánh dấu bài đăng của admin
        };

        // Capture author fullname and avatar
        try {
            const user = await userServices.GetUserInfor(decoded._id);
            if (user) {
                payload.authorFullname = user.fullname || '';
                payload.authorAvatar = user.avatar || '';
                payload.authorRoles = decoded.roles || ['user'];
            }
        } catch (error) {
            console.log('Error fetching user info:', error);
        }

        const result = await postServices.createPost(payload);
        res.status(StatusCodes.CREATED).json({
            message: isAdmin ? 'Tạo bài đăng thành công và đã được duyệt' : 'Tạo bài đăng thành công, đang chờ duyệt',
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài đăng' });
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài đăng' });
        }

        // Check if user is owner or admin
        const isAdmin = decoded.roles?.includes('admin');
        const isOwner = post.userId === decoded._id;
        
        if (!isOwner && !isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Bạn không có quyền chỉnh sửa bài đăng này' });
        }

        let updatePayload = { ...req.body };

        // Xử lý ảnh upload khi update
        if (req.files && req.files.length > 0) {
            // Ảnh mới được upload
            const newImages = req.files.map(file => `/uploads/images/${file.filename}`);
            // Giữ lại ảnh cũ nếu có và thêm ảnh mới
            const existingImages = req.body.existingImages ? 
                (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : [];
            updatePayload.images = [...existingImages, ...newImages];
        }

        // QUAN TRỌNG: Admin không được thay đổi thông tin người đăng
        // Xóa các trường không được phép thay đổi
        delete updatePayload.userId;
        delete updatePayload.authorFullname;
        delete updatePayload.authorAvatar;
        delete updatePayload.authorRoles;
        delete updatePayload.existingImages; // Xóa field tạm

        // Chỉ cập nhật author info nếu là chủ bài đăng (không phải admin đang sửa bài của người khác)
        if (isOwner) {
            try {
                const user = await userServices.GetUserInfor(decoded._id);
                if (user) {
                    updatePayload.authorFullname = user.fullname || '';
                    updatePayload.authorAvatar = user.avatar || '';
                    updatePayload.authorRoles = decoded.roles || ['user'];
                }
            } catch (error) {
                console.log('Error fetching user info:', error);
            }
        }

        // Xử lý logic returnStatus và status
        // returnStatus có thể là true/false hoặc 'gửi trả'/'chưa tìm thấy'
        if (updatePayload.returnStatus !== undefined) {
            const isReturned = updatePayload.returnStatus === true || updatePayload.returnStatus === 'gửi trả';
            // Chuẩn hóa returnStatus thành string
            updatePayload.returnStatus = isReturned ? 'gửi trả' : 'chưa tìm thấy';
            // Tự động cập nhật status
            if (!updatePayload.status) {
                updatePayload.status = isReturned ? 'completed' : 'approved';
            }
        }
        
        // User thường không được thay đổi status trực tiếp (trừ khi liên quan đến returnStatus)
        if (!isAdmin && updatePayload.status && updatePayload.returnStatus === undefined) {
            delete updatePayload.status; // Xóa nếu user cố tình đổi status mà không qua returnStatus
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
                    type: 'like',
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

const markItemFound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can mark items as found' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        const result = await postServices.updatePost(id, { status: 'completed' });

        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: 'Đồ vật đã được tìm thấy',
                    message: `Đồ vật "${post.title}" đã được tìm thấy và xác nhận trả lại.`,
                    type: 'item_found',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create found notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Item marked as found successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const markItemNotFound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can mark items as not found' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        // Reset to approved status (item not found, but still active for searching)
        const result = await postServices.updatePost(id, { status: 'approved' });

        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: 'Xác nhận chưa tìm thấy đồ vật',
                    message: `Đồ vật "${post.title}" chưa được tìm thấy. Tiếp tục tìm kiếm.`,
                    type: 'item_not_found',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create not found notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Item marked as not found successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateReturnStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { returnStatus } = req.body;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can update return status' });
        }

        if (!returnStatus || !['gửi trả', 'chưa tìm thấy'].includes(returnStatus)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid return status. Must be "gửi trả" or "chưa tìm thấy"' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        // Khi đánh dấu "gửi trả" thì status = completed
        // Khi đánh dấu "chưa tìm thấy" thì status = approved
        const newStatus = returnStatus === 'gửi trả' ? 'completed' : 'approved';
        const result = await postServices.updatePost(id, { returnStatus, status: newStatus });

        // Gửi thông báo cho người đăng
        if (post.userId && post.userId !== decoded._id) {
            try {
                const title = returnStatus === 'gửi trả' ? 'Đồ vật đã được trả' : 'Cập nhật trạng thái đồ vật';
                const message = returnStatus === 'gửi trả' 
                    ? `Đồ vật "${post.title}" đã được xác nhận trả lại cho chủ sở hữu.`
                    : `Đồ vật "${post.title}" được cập nhật trạng thái: chưa tìm thấy.`;
                
                await notificationServices.createNotification({
                    userId: post.userId,
                    title,
                    message,
                    type: returnStatus === 'gửi trả' ? 'item_found' : 'item_not_found',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create return status notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Return status updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Cấm bài đăng (do vi phạm/tố cáo)
const banPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can ban posts' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        const result = await postServices.banPost(id, reason);

        // Gửi thông báo cho người đăng
        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: '⚠️ Bài đăng bị cấm',
                    message: `Bài đăng "${post.title}" đã bị cấm do vi phạm quy định. Lý do: ${reason || 'Vi phạm quy định cộng đồng'}`,
                    type: 'post_banned',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create ban notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Post banned successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Gỡ cấm bài đăng
const unbanPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;
        
        if (!decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Only admin can unban posts' });
        }

        const post = await postServices.getPostById(id);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        }

        const result = await postServices.unbanPost(id);

        // Gửi thông báo cho người đăng
        if (post.userId && post.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: post.userId,
                    title: '✅ Bài đăng đã được gỡ cấm',
                    message: `Bài đăng "${post.title}" đã được gỡ cấm và hiển thị trở lại.`,
                    type: 'post_approved',
                    relatedId: id
                });
            } catch (notifyError) {
                console.error('Failed to create unban notification:', notifyError);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Post unbanned successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Chia sẻ bài đăng - tạo bài mới với thông tin bài gốc được nhúng
const sharePost = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập' });
        }

        const { originalPostId, shareComment } = req.body;
        
        if (!originalPostId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Thiếu ID bài đăng gốc' });
        }

        // Lấy thông tin bài đăng gốc
        const originalPost = await postServices.getPostById(originalPostId);
        if (!originalPost) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy bài đăng gốc' });
        }

        // Lấy thông tin người chia sẻ
        let sharerInfo = { fullname: 'Người dùng', avatar: null };
        try {
            const user = await userServices.GetUserInfor(decoded._id);
            if (user) {
                sharerInfo.fullname = user.fullname || 'Người dùng';
                sharerInfo.avatar = user.avatar || null;
            }
        } catch (error) {
            console.log('Error fetching sharer info:', error);
        }

        // QUAN TRỌNG: Lưu thông tin bài gốc TẠI THỜI ĐIỂM CHIA SẺ
        // Không lấy thông tin user mới nhất - giữ nguyên avatar và tên từ bài gốc
        const originalAuthorInfo = {
            fullname: originalPost.authorFullname || originalPost.user?.fullname || 'Ẩn danh',
            avatar: originalPost.authorAvatar || originalPost.user?.avatar || null
        };

        // Tạo bài đăng chia sẻ - lưu nguyên thông tin bài gốc (đóng băng tại thời điểm chia sẻ)
        const sharePayload = {
            // Thông tin người chia sẻ
            userId: decoded._id,
            authorFullname: sharerInfo.fullname,
            authorAvatar: sharerInfo.avatar,
            
            // Đánh dấu là bài chia sẻ
            isShared: true,
            shareComment: shareComment || '', // Lời bình của người chia sẻ
            
            // Lưu nguyên thông tin bài gốc (không thể chỉnh sửa)
            originalPost: {
                _id: originalPost._id,
                title: originalPost.title,
                description: originalPost.description,
                category: originalPost.category,
                itemType: originalPost.itemType,
                location: originalPost.location,
                images: originalPost.images || [],
                authorFullname: originalAuthorInfo.fullname,
                authorAvatar: originalAuthorInfo.avatar,
                userId: originalPost.userId,
                createdAt: originalPost.createdAt
            },
            
            // Copy một số thông tin để hiển thị
            title: `Chia sẻ: ${originalPost.title}`,
            description: shareComment || `Chia sẻ từ bài đăng của ${originalPost.authorFullname || 'người dùng'}`,
            category: originalPost.category,
            itemType: originalPost.itemType,
            location: originalPost.location,
            images: originalPost.images || [],
            
            // Bài chia sẻ tự động được duyệt
            status: 'approved',
            sharedFrom: originalPostId,
            sharedFromUser: originalPost.userId
        };

        const result = await postServices.createPost(sharePayload);

        // Gửi thông báo cho chủ bài gốc
        if (originalPost.userId && originalPost.userId !== decoded._id) {
            try {
                await notificationServices.createNotification({
                    userId: originalPost.userId,
                    title: '🔗 Bài đăng được chia sẻ',
                    message: `${sharerInfo.fullname} đã chia sẻ bài đăng "${originalPost.title}" của bạn`,
                    type: 'post_shared',
                    relatedId: originalPostId
                });
            } catch (notifyError) {
                console.error('Failed to create share notification:', notifyError);
            }
        }

        res.status(StatusCodes.CREATED).json({
            message: 'Chia sẻ bài đăng thành công',
            data: result
        });
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
    toggleLike,
    markItemFound,
    markItemNotFound,
    updateReturnStatus,
    banPost,
    unbanPost,
    sharePost
};

