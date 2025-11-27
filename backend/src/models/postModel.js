import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

const POST_COLLECTION_NAME = 'posts';

const POST_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().valid('lost', 'found').required(), // lost: đồ thất lạc, found: đồ nhặt được
    itemType: Joi.string().required(), // Loại đồ vật: điện thoại, chìa khóa, ví, etc.
    location: Joi.string().required(), // Vị trí mất/nhặt được
    images: Joi.array().items(Joi.string()).default([]), // URLs của ảnh
    contactInfo: Joi.object({
        phone: Joi.string(),
        email: Joi.string().email(),
    }).optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed').default('pending'), // pending: chờ duyệt, approved: đã duyệt, rejected: từ chối, completed: đã trả
    userId: Joi.string().required(), // ID người đăng
    authorAvatar: Joi.string().optional(), // Avatar của người đăng khi post được tạo
    authorFullname: Joi.string().optional(), // Fullname của người đăng khi post được tạo
    returnStatus: Joi.string().valid('gửi trả', 'chưa tìm thấy').optional(), // Trạng thái trả: 'gửi trả' hoặc 'chưa tìm thấy'
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
});

const validateCreated = async (data) => {
    return await POST_COLLECTION_SCHEMA.validateAsync(data);
};

const createPost = async (payload) => {
    try {
        const validatedData = await validateCreated(payload);
        const result = await GET_DB().collection(POST_COLLECTION_NAME).insertOne(validatedData);
        return result;
    } catch (error) {
        throw error;
    }
};

const findPostById = async (id) => {
    try {
        const result = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $addFields: {
                        userObjId: {
                            $convert: { input: '$userId', to: 'objectId', onError: null, onNull: null }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userObjId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ])
            .toArray();
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        throw error;
    }
};

const findPosts = async ({ 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = -1,
    category,
    itemType,
    location,
    search,
    status,
    userId
}) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build query filter
        const filter = {};
        if (category) filter.category = category;
        if (itemType) filter.itemType = { $regex: itemType, $options: 'i' };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (status) filter.status = status;
        if (userId) filter.userId = userId;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { itemType: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const totalCount = await GET_DB().collection(POST_COLLECTION_NAME).countDocuments(filter);

        const posts = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .aggregate([
                { $match: filter },
                { $sort: { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $addFields: {
                        userObjId: {
                            $convert: { input: '$userId', to: 'objectId', onError: null, onNull: null }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userObjId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ])
            .toArray();

        return {
            data: posts,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

const updatePost = async (id, payload) => {
    try {
        const updateData = {
            ...payload,
            updatedAt: Date.now()
        };
        const result = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

const deletePost = async (id) => {
    try {
        const result = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .deleteOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw error;
    }
};

const toggleLike = async (postId, userId) => {
    try {
        const db = GET_DB().collection(POST_COLLECTION_NAME);
        // check if user already liked
        const post = await db.findOne({ _id: new ObjectId(postId) });
        if (!post) return null;
        const likes = post.likes || [];
        let result;
        if (likes.includes(userId)) {
            result = await db.findOneAndUpdate(
                { _id: new ObjectId(postId) },
                { $pull: { likes: userId } },
                { returnDocument: 'after' }
            );
        } else {
            result = await db.findOneAndUpdate(
                { _id: new ObjectId(postId) },
                { $addToSet: { likes: userId } },
                { returnDocument: 'after' }
            );
        }
        return result;
    } catch (error) {
        throw error;
    }
};

const getTopPosters = async ({ limit = 10 }) => {
    try {
        const parsedLimit = parseInt(limit, 10);
        const limitNum = Math.max(
            1,
            Math.min(100, Number.isNaN(parsedLimit) ? 10 : parsedLimit)
        );

        const pipeline = [
            {
                $group: {
                    _id: '$userId',
                    totalPosts: { $sum: 1 },
                    latestPostAt: { $max: '$createdAt' }
                }
            },
            {
                $sort: { totalPosts: -1, latestPostAt: -1 }
            },
            { $limit: limitNum },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$_id' },
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
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    totalPosts: 1,
                    latestPostAt: 1,
                    user: {
                        _id: '$user._id',
                        fullname: '$user.fullname',
                        email: '$user.email',
                        phone: '$user.phone',
                        roles: '$user.roles'
                    }
                }
            }
        ];

        const results = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .aggregate(pipeline)
            .toArray();

        return {
            data: results
        };
    } catch (error) {
        throw error;
    }
};

export const POSTMODEL = {
    createPost,
    findPostById,
    findPosts,
    updatePost,
    deletePost,
    getTopPosters,
    toggleLike
};

