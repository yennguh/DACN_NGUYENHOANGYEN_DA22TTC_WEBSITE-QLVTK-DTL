import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

const NOTIFICATION_COLLECTION_NAME = 'notifications';

const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
    userId: Joi.string().required(), // ID người nhận thông báo
    title: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string().valid('post_approved', 'post_rejected', 'item_found', 'item_not_found', 'message_received', 'comment', 'like', 'system').default('system'),
    relatedId: Joi.string().optional(), // ID liên quan (postId, contactId, etc.)
    isRead: Joi.boolean().default(false),
    createdAt: Joi.date().timestamp('javascript').default(Date.now)
});

const validateCreated = async (data) => {
    return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data);
};

const createNotification = async (payload) => {
    try {
        const validatedData = await validateCreated(payload);
        const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertOne(validatedData);
        return result;
    } catch (error) {
        throw error;
    }
};

const buildUserIdMatcher = (userId) => {
    if (!userId) return null;

    const candidates = [];

    if (userId instanceof ObjectId) {
        candidates.push(userId);
    } else if (typeof userId === 'string') {
        const trimmed = userId.trim();
        if (trimmed) {
            candidates.push(trimmed);
            if (ObjectId.isValid(trimmed)) {
                candidates.push(new ObjectId(trimmed));
            }
        }
    } else if (typeof userId === 'object') {
        const possibleValues = [];

        if (userId.$oid && typeof userId.$oid === 'string') {
            possibleValues.push(userId.$oid);
        }

        if (typeof userId.toHexString === 'function') {
            possibleValues.push(userId.toHexString());
        }

        if (typeof userId.valueOf === 'function') {
            const valueOfResult = userId.valueOf();
            if (typeof valueOfResult === 'string') {
                possibleValues.push(valueOfResult);
            }
            if (valueOfResult instanceof ObjectId) {
                possibleValues.push(valueOfResult);
            }
        }

        const asString = userId.toString();
        if (asString && asString !== '[object Object]') {
            possibleValues.push(asString);
        }

        possibleValues.forEach((value) => {
            if (!value) return;
            if (value instanceof ObjectId) {
                candidates.push(value);
                return;
            }
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (!trimmed || trimmed === '[object Object]') return;
                candidates.push(trimmed);
                if (ObjectId.isValid(trimmed)) {
                    candidates.push(new ObjectId(trimmed));
                }
            }
        });
    }

    if (!candidates.length) return null;

    const unique = [];
    const seen = new Set();

    candidates.forEach((candidate) => {
        const key = candidate instanceof ObjectId ? `oid:${candidate.toString()}` : `str:${candidate}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(candidate);
        }
    });

    if (unique.length === 1) return unique[0];
    return { $in: unique };
};

const findNotifications = async (userId, { page = 1, limit = 20, isRead }) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const userIdMatcher = buildUserIdMatcher(userId);
        if (!userIdMatcher) {
            return {
                data: [],
                unreadCount: 0,
                pagination: {
                    total: 0,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: 0
                }
            };
        }

        const filter = { userId: userIdMatcher };
        if (isRead !== undefined) filter.isRead = isRead === 'true';

        const totalCount = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).countDocuments(filter);

        const notifications = await GET_DB()
            .collection(NOTIFICATION_COLLECTION_NAME)
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const unreadCount = await GET_DB()
            .collection(NOTIFICATION_COLLECTION_NAME)
            .countDocuments({ userId: userIdMatcher, isRead: false });

        return {
            data: notifications,
            unreadCount,
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

const markAsRead = async (id, userId) => {
    try {
        const userIdMatcher = buildUserIdMatcher(userId);
        const result = await GET_DB()
            .collection(NOTIFICATION_COLLECTION_NAME)
            .updateOne(
                { _id: new ObjectId(id), userId: userIdMatcher },
                { $set: { isRead: true } }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

const markAllAsRead = async (userId) => {
    try {
        const userIdMatcher = buildUserIdMatcher(userId);
        const result = await GET_DB()
            .collection(NOTIFICATION_COLLECTION_NAME)
            .updateMany(
                { userId: userIdMatcher, isRead: false },
                { $set: { isRead: true } }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

export const NOTIFICATIONMODEL = {
    createNotification,
    findNotifications,
    markAsRead,
    markAllAsRead
};

