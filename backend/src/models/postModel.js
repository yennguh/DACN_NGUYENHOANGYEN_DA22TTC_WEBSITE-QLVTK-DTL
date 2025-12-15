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
    banned: Joi.boolean().default(false), // Bài đăng bị cấm do vi phạm
    bannedReason: Joi.string().optional(), // Lý do bị cấm
    bannedAt: Joi.date().timestamp('javascript').optional(), // Thời gian bị cấm
    sharedFrom: Joi.string().optional(), // ID bài đăng gốc (nếu là bài chia sẻ)
    sharedFromUser: Joi.string().optional(), // ID người đăng bài gốc
    isShared: Joi.boolean().default(false), // Đánh dấu bài đăng được chia sẻ
    shareComment: Joi.string().optional().allow(''), // Lời bình của người chia sẻ
    originalPost: Joi.object({
        _id: Joi.any(),
        title: Joi.string(),
        description: Joi.string(),
        category: Joi.string(),
        itemType: Joi.string(),
        location: Joi.string(),
        images: Joi.array().items(Joi.string()),
        authorFullname: Joi.string().allow(''),
        authorAvatar: Joi.string().allow('', null),
        userId: Joi.string(),
        createdAt: Joi.any()
    }).optional(), // Thông tin bài đăng gốc (không thể chỉnh sửa)
    isAdminPost: Joi.boolean().default(false), // Đánh dấu bài đăng của admin
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
    userId,
    returnStatus,
    includeBanned = false // Mặc định không hiển thị bài bị cấm
}) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build query filter
        const filter = {};
        const andConditions = [];
        
        // Lọc bài bị cấm - nhưng nếu có userId (xem profile) thì cho phép xem tất cả bài của user đó
        const shouldFilterBanned = !includeBanned && includeBanned !== 'true' && !userId;
        if (shouldFilterBanned) {
            andConditions.push({
                $or: [
                    { banned: { $exists: false } },
                    { banned: false }
                ]
            });
        }
        
        if (category) filter.category = category;
        if (itemType) filter.itemType = { $regex: itemType, $options: 'i' };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (status) filter.status = status;
        if (userId) filter.userId = String(userId); // Đảm bảo userId là string
        if (returnStatus) filter.returnStatus = returnStatus;
        if (search) {
            andConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { itemType: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Kết hợp filter với andConditions
        const finalFilter = andConditions.length > 0 
            ? { ...filter, $and: andConditions }
            : filter;

        const totalCount = await GET_DB().collection(POST_COLLECTION_NAME).countDocuments(finalFilter);

        const posts = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .aggregate([
                { $match: finalFilter },
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
                        roles: '$user.roles',
                        avatar: '$user.avatar'
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

const banPost = async (id, reason) => {
    try {
        const result = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        banned: true, 
                        bannedReason: reason || 'Vi phạm quy định',
                        bannedAt: Date.now(),
                        updatedAt: Date.now()
                    } 
                },
                { returnDocument: 'after' }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

const unbanPost = async (id) => {
    try {
        const result = await GET_DB()
            .collection(POST_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        banned: false, 
                        bannedReason: null,
                        bannedAt: null,
                        updatedAt: Date.now()
                    } 
                },
                { returnDocument: 'after' }
            );
        return result;
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
    toggleLike,
    banPost,
    unbanPost
};

