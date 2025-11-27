import { POSTMODEL } from "../models/postModel.js";

const createPost = async (payload) => {
    try {
        const result = await POSTMODEL.createPost(payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const getPostById = async (id) => {
    try {
        const result = await POSTMODEL.findPostById(id);
        return result;
    } catch (error) {
        throw error;
    }
};

const getPosts = async (params) => {
    try {
        const result = await POSTMODEL.findPosts(params);
        return result;
    } catch (error) {
        throw error;
    }
};

const updatePost = async (id, payload) => {
    try {
        const result = await POSTMODEL.updatePost(id, payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const deletePost = async (id) => {
    try {
        const result = await POSTMODEL.deletePost(id);
        return result;
    } catch (error) {
        throw error;
    }
};

const getTopPosters = async (params) => {
    try {
        const result = await POSTMODEL.getTopPosters(params);
        return result;
    } catch (error) {
        throw error;
    }
};

const toggleLike = async (postId, userId) => {
    try {
        const result = await POSTMODEL.toggleLike(postId, userId);
        return result;
    } catch (error) {
        throw error;
    }
};

export const postServices = {
    createPost,
    getPostById,
    getPosts,
    updatePost,
    deletePost,
    getTopPosters
    , toggleLike
};

