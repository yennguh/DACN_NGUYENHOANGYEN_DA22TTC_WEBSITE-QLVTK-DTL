import Joi from "joi"
const User_COLLECTION_NAME = 'users'
import { ObjectId } from "mongodb"
import { GET_DB } from "../config/mongodb.js"
const USER_COLLECTION_SCHEMA = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string(),
    phone: Joi.string().required(),
    roles: Joi.array().items(Joi.string().valid('user', 'admin', 'dev')).required(),
    fullname: Joi.string().required(),
    avatar: Joi.string().optional(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updateAt: Joi.date().timestamp('javascript').default(null)
})

const USER_UPDATE_SCHEMA = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string(),
    fullname: Joi.string(),
    roles: Joi.array().items(Joi.string().valid('user', 'admin', 'dev')),
    password: Joi.string(),
    avatar: Joi.string().optional()
}).min(1);

const validateCreated = async (data) => {
    return await USER_COLLECTION_SCHEMA.validateAsync(data);
}

const validateUpdated = async (data) => {
    return await USER_UPDATE_SCHEMA.validateAsync(data);
}
const CreatedUser = async (payload) => {
    try {
        const user = await GET_DB().collection(User_COLLECTION_NAME).findOne({ email: payload.email })
        if (user) {
            throw new Error("Email da ton tai")
        }
        const validadata = await validateCreated(payload)
        const result = await GET_DB().collection(User_COLLECTION_NAME).insertOne(validadata)
        return result;
    }
    catch (error) {
        throw error
    }
}
const FindUserById = async (id) => {
    try {
        const result = await GET_DB().collection(User_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
        return result;
    }
    catch (error) {
        throw error
    }
}
const Login = async (payload) => {
    try {
        const result = await GET_DB().collection(User_COLLECTION_NAME).findOne({
            email: payload.email,
            password: payload.password
        })
        return result;
    }
    catch (error) {
        throw error
    }
}

const ListUsers = async ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 }) => {
    try {
        // Convert to numbers and ensure valid values
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 items per page
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination info
        const totalCount = await GET_DB().collection(User_COLLECTION_NAME).countDocuments();

        // Fetch paginated results
        const users = await GET_DB()
            .collection(User_COLLECTION_NAME)
            .find({})
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limitNum)
            .project({ password: 0 }) // Exclude password from results
            .toArray();

        return {
            data: users,
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
}

const UpdateUser = async (id, payload) => {
    try {
        const validatedData = await validateUpdated(payload);
        const updateData = {
            ...validatedData,
            updateAt: Date.now()
        };

        const result = await GET_DB()
            .collection(User_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after', projection: { password: 0 } }
            );

        return result.value;
    } catch (error) {
        throw error;
    }
}

const DeleteUser = async (id) => {
    try {
        const result = await GET_DB()
            .collection(User_COLLECTION_NAME)
            .deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            throw new Error('User not found');
        }
        
        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        throw error;
    }
}

export const USERMODEL = {
    CreatedUser,
    FindUserById,
    Login,
    ListUsers,
    UpdateUser,
    DeleteUser
}
