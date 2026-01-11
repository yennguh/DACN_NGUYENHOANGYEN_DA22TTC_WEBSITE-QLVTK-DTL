import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

const CONTACT_COLLECTION_NAME = 'contacts';

const normalizeUserId = (userId) => {
    if (!userId) return undefined;
    if (typeof userId === 'string') return userId.trim() || undefined;
    if (userId instanceof ObjectId) return userId.toString();

    if (typeof userId === 'object') {
        if (userId.$oid && typeof userId.$oid === 'string') {
            return userId.$oid;
        }
        if (typeof userId.toHexString === 'function') {
            return userId.toHexString();
        }
        if (typeof userId.valueOf === 'function') {
            const value = userId.valueOf();
            if (value instanceof ObjectId) return value.toString();
            if (typeof value === 'string') return value;
        }
        const asString = userId.toString();
        if (asString && asString !== '[object Object]') return asString;
    }

    return undefined;
};

const REPLY_SCHEMA = Joi.object({
    message: Joi.string().allow('').optional(),
    image: Joi.string().optional(), // URL ảnh đính kèm
    sender: Joi.string().valid('user', 'admin').required(),
    senderId: Joi.string().optional().allow(null),
    senderName: Joi.string().optional(),
    senderAvatar: Joi.string().optional().allow(null), // Avatar của người gửi
    createdAt: Joi.date().timestamp('javascript').default(Date.now)
});

const CONTACT_COLLECTION_SCHEMA = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    status: Joi.string().valid('new', 'read', 'replied').default('new'),
    userId: Joi.string().optional(), // Optional: nếu user đã đăng nhập
    replies: Joi.array().items(REPLY_SCHEMA).default([]), // Mảng các tin nhắn phản hồi
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
});

const validateCreated = async (data) => {
    return await CONTACT_COLLECTION_SCHEMA.validateAsync(data);
};

const createContact = async (payload) => {
    try {
        const normalizedPayload = {
            ...payload,
            userId: normalizeUserId(payload?.userId)
        };

        const validatedData = await validateCreated(normalizedPayload);
        const result = await GET_DB().collection(CONTACT_COLLECTION_NAME).insertOne(validatedData);
        return result;
    } catch (error) {
        throw error;
    }
};

const findContacts = async ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1, status, includeBlocked = false }) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        
        // Đảm bảo includeBlocked là boolean
        const isBlocked = includeBlocked === true || includeBlocked === 'true';

        const filter = {
            hiddenForAdmin: { $ne: true } // Không lấy tin đã ẩn với admin
        };
        if (status) filter.status = status;
        
        // Nếu isBlocked = true thì lấy tin của user bị chặn
        // Nếu isBlocked = false thì chỉ lấy tin của user chưa bị chặn
        if (isBlocked) {
            filter.userBlocked = true;
        } else {
            filter.userBlocked = { $ne: true };
        }

        const totalCount = await GET_DB().collection(CONTACT_COLLECTION_NAME).countDocuments(filter);

        const contacts = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        return {
            data: contacts,
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

const findContactById = async (id) => {
    try {
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .findOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw error;
    }
};

const updateContact = async (id, payload) => {
    try {
        const updateData = {
            ...payload,
            updatedAt: Date.now()
        };
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        return result.value;
    } catch (error) {
        throw error;
    }
};

const addReply = async (contactId, replyData) => {
    try {
        const validatedReply = await REPLY_SCHEMA.validateAsync(replyData);
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(contactId) },
                { 
                    $push: { replies: validatedReply },
                    $set: { 
                        status: 'replied',
                        updatedAt: Date.now()
                    }
                },
                { returnDocument: 'after' }
            );
        return result.value;
    } catch (error) {
        throw error;
    }
};

const getContactByUserId = async (userId) => {
    try {
        // Normalize userId để so sánh
        const normalizedUserId = normalizeUserId(userId);
        
        if (!normalizedUserId) {
            return [];
        }

        // Tìm theo cả string và có thể ObjectId, không lấy những tin đã ẩn với user
        const contacts = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .find({ 
                $and: [
                    { $or: [
                        { userId: normalizedUserId },
                        { userId: userId }
                    ]},
                    { hiddenForUser: { $ne: true } } // Không lấy tin đã ẩn với user
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();
        return contacts;
    } catch (error) {
        throw error;
    }
};

const deleteContact = async (id) => {
    try {
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .deleteOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        throw error;
    }
};

// Đánh dấu tất cả tin nhắn của user là bị chặn
const markUserContactsBlocked = async (userId) => {
    try {
        const normalizedUserId = normalizeUserId(userId);
        if (!normalizedUserId) return { modifiedCount: 0 };
        
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .updateMany(
                { $or: [{ userId: normalizedUserId }, { userId: userId }] },
                { $set: { userBlocked: true, updatedAt: Date.now() } }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

// Bỏ đánh dấu chặn cho tất cả tin nhắn của user
const unmarkUserContactsBlocked = async (userId) => {
    try {
        const normalizedUserId = normalizeUserId(userId);
        if (!normalizedUserId) return { modifiedCount: 0 };
        
        const result = await GET_DB()
            .collection(CONTACT_COLLECTION_NAME)
            .updateMany(
                { $or: [{ userId: normalizedUserId }, { userId: userId }] },
                { $set: { userBlocked: false, updatedAt: Date.now() } }
            );
        return result;
    } catch (error) {
        throw error;
    }
};

export const CONTACTMODEL = {
    createContact,
    findContacts,
    findContactById,
    updateContact,
    addReply,
    getContactByUserId,
    deleteContact,
    markUserContactsBlocked,
    unmarkUserContactsBlocked
};
