import { COMMENTMODEL } from "../models/commentModel.js";
import { POSTMODEL } from "../models/postModel.js";

const createComment = async (payload) => {
    try {
        const post = await POSTMODEL.findPostById(payload.postId);
        if (!post) throw new Error('Post not found');
        // Chỉ cho phép bình luận nếu bài đăng đã được duyệt
        if (post.status !== 'approved') {
            const err = new Error('Cannot comment on a post that is not approved');
            err.status = 403;
            throw err;
        }
        const result = await COMMENTMODEL.createComment(payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const getCommentsByPostId = async (postId, params) => {
    try {
        const result = await COMMENTMODEL.findCommentsByPostId(postId, params);
        return result;
    } catch (error) {
        throw error;
    }
};

const getCommentById = async (id) => {
    try {
        const result = await COMMENTMODEL.findCommentById(id);
        return result;
    } catch (error) {
        throw error;
    }
};

const updateComment = async (id, payload) => {
    try {
        const result = await COMMENTMODEL.updateComment(id, payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteComment = async (id) => {
    try {
        const result = await COMMENTMODEL.deleteComment(id);
        return result;
    } catch (error) {
        throw error;
    }
};

export const commentServices = {
    createComment,
    getCommentsByPostId,
    getCommentById,
    updateComment,
    deleteComment
};
