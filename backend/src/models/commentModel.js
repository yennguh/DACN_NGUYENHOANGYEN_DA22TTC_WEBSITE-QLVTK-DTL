import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

const COMMENT_COLLECTION_NAME = 'comments';

const COMMENT_COLLECTION_SCHEMA = Joi.object({
    postId: Joi.string().required(),
    userId: Joi.string().required(),
    content: Joi.string().required(),
    parentId: Joi.string().allow(null).default(null), // ID của comment cha (nếu là reply)
    likes: Joi.array().items(Joi.string()).default([]), // Danh sách userId đã like
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
});

const validateCreated = async (data) => {
    return await COMMENT_COLLECTION_SCHEMA.validateAsync(data);
};

const createComment = async (payload) => {
    try {
        const validated = await validateCreated(payload);
        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).insertOne(validated);
        return result;
    } catch (error) {
        throw error;
    }
};

const findCommentsByPostId = async (postId, { page = 1, limit = 50 } = {}) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const pipeline = [
            { $match: { postId: postId } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$_id',
                                        {
                                            $convert: {
                                                input: '$$userId',
                                                to: 'objectId',
                                                onError: null,
                                                onNull: null
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { password: 0 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    content: 1,
                    postId: 1,
                    userId: 1,
                    parentId: 1,
                    likes: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: '$user._id',
                        fullname: '$user.fullname',
                        email: '$user.email',
                        phone: '$user.phone',
                        avatar: '$user.avatar'
                    }
                }
            }
        ];

        const comments = await GET_DB().collection(COMMENT_COLLECTION_NAME).aggregate(pipeline).toArray();
        return comments;
    } catch (error) {
        throw error;
    }
};

const findCommentById = async (id) => {
    try {
        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw error;
    }
};

const updateComment = async (id, payload) => {
    try {
        const updateData = {
            ...payload,
            updatedAt: Date.now()
        };
        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteComment = async (id) => {
    try {
        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw error;
    }
};

const toggleLike = async (commentId, userId) => {
    try {
        const comment = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOne({ _id: new ObjectId(commentId) });
        if (!comment) return null;

        const likes = comment.likes || [];
        const hasLiked = likes.includes(userId);

        const update = hasLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } };

        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(commentId) },
            update,
            { returnDocument: 'after' }
        );
        return result;
    } catch (error) {
        throw error;
    }
};

export const COMMENTMODEL = {
    createComment,
    findCommentsByPostId,
    findCommentById,
    updateComment,
    deleteComment,
    toggleLike
};
