import { StatusCodes } from "http-status-codes";
import { commentServices } from "../services/commentServices.js";
import { postServices } from "../services/postServices.js";
import { notificationServices } from "../services/notificationServices.js";

const createComment = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const payload = {
            postId: req.body.postId,
            userId: decoded._id,
            content: req.body.content
        };

        const result = await commentServices.createComment(payload);
            // Create notification for post owner
            try {
                const post = await postServices.getPostById(payload.postId);
                if (post && post.userId && post.userId !== payload.userId) {
                    await notificationServices.createNotification({
                        userId: post.userId,
                        title: 'Bình luận mới',
                        message: `Có bình luận mới trên bài đăng của bạn: ${post.title}`,
                        type: 'comment',
                        relatedId: payload.postId
                    });
                }
            } catch (notifyErr) {
                console.error('Failed to create comment notification', notifyErr);
            }

            return res.status(StatusCodes.CREATED).json({ message: 'Comment created', data: result });
    } catch (error) {
        next(error);
    }
};

const getCommentsByPostId = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const params = req.query;
        const result = await commentServices.getCommentsByPostId(postId, params);
        return res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;

        const comment = await commentServices.getCommentById(id);
        if (!comment) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
        }

        if (comment.userId !== decoded._id && !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to update this comment' });
        }

        const result = await commentServices.updateComment(id, { content: req.body.content });
        return res.status(StatusCodes.OK).json({ message: 'Comment updated', data: result });
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const decoded = req.jwtDecoded;

        const comment = await commentServices.getCommentById(id);
        if (!comment) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
        }

        if (comment.userId !== decoded._id && !decoded.roles?.includes('admin')) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to delete this comment' });
        }

        const result = await commentServices.deleteComment(id);
        return res.status(StatusCodes.OK).json({ message: 'Comment deleted', data: result });
    } catch (error) {
        next(error);
    }
};

const toggleLike = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        const result = await commentServices.toggleLike(id, decoded._id);
        
        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Comment not found' });
        }

        return res.status(StatusCodes.OK).json({ message: 'Toggled like', data: result });
    } catch (error) {
        next(error);
    }
};

const replyComment = async (req, res, next) => {
    try {
        const decoded = req.jwtDecoded;
        if (!decoded || !decoded._id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const { id } = req.params; // parent comment id
        const parentComment = await commentServices.getCommentById(id);
        if (!parentComment) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Parent comment not found' });
        }

        const payload = {
            postId: parentComment.postId,
            userId: decoded._id,
            content: req.body.content,
            parentId: id
        };

        const result = await commentServices.createComment(payload);

        // Tạo notification cho người được reply
        if (parentComment.userId && parentComment.userId !== decoded._id) {
            try {
                const post = await postServices.getPostById(parentComment.postId);
                await notificationServices.createNotification({
                    userId: parentComment.userId,
                    title: 'Trả lời bình luận',
                    message: `${decoded.fullname || 'Một người dùng'} đã trả lời bình luận của bạn${post ? ` trong bài "${post.title}"` : ''}`,
                    type: 'comment',
                    relatedId: parentComment.postId
                });
            } catch (notifyErr) {
                console.error('Failed to create reply notification', notifyErr);
            }
        }

        return res.status(StatusCodes.CREATED).json({ message: 'Reply created', data: result });
    } catch (error) {
        next(error);
    }
};

export const commentController = {
    createComment,
    getCommentsByPostId,
    updateComment,
    deleteComment,
    toggleLike,
    replyComment
};
