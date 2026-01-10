import { USERMODEL } from "../models/usermodel.js";


const CreatedUser = async (payload) => {
    try {
        const result = USERMODEL.CreatedUser(payload);
        return result;

    }
    catch (error) {
        throw error
    }

}

const GetUserInfor = async (id) => {
    try {
        const result = USERMODEL.FindUserById(id);
        return result

    }
    catch (error) {
        throw error
    }

}

const Login_User = async (payload) => {
    try {
        const result = USERMODEL.Login(payload);
        return result;

    }
    catch (error) {
        throw error
    }

}

const ListUsers = async (params) => {
    try {
        const result = await USERMODEL.ListUsers(params);
        return result;
    } catch (error) {
        throw error;
    }
}

const UpdateUser = async (id, payload) => {
    try {
        const result = await USERMODEL.UpdateUser(id, payload);
        return result;
    } catch (error) {
        throw error;
    }
}

const DeleteUser = async (id) => {
    try {
        const result = await USERMODEL.DeleteUser(id);
        return result;
    } catch (error) {
        throw error;
    }
}

const GetUserByEmail = async (email) => {
    try {
        const result = await USERMODEL.FindUserByEmail(email);
        return result;
    } catch (error) {
        throw error;
    }
}

const CreatedUserGoogle = async (payload) => {
    try {
        const result = await USERMODEL.CreatedUserGoogle(payload);
        return result;
    } catch (error) {
        throw error;
    }
}

const UpdateUserGoogleId = async (id, googleId, avatar) => {
    try {
        const result = await USERMODEL.UpdateUserGoogleId(id, googleId, avatar);
        return result;
    } catch (error) {
        throw error;
    }
}

const BlockUserFromContact = async (userId) => {
    try {
        const result = await USERMODEL.BlockUserFromContact(userId);
        return result;
    } catch (error) {
        throw error;
    }
}

const UnblockUserFromContact = async (userId) => {
    try {
        const result = await USERMODEL.UnblockUserFromContact(userId);
        return result;
    } catch (error) {
        throw error;
    }
}

const GetBlockedUsers = async () => {
    try {
        const result = await USERMODEL.GetBlockedUsers();
        return result;
    } catch (error) {
        throw error;
    }
}

export const userServices = {
    CreatedUser,
    GetUserInfor,
    Login_User,
    ListUsers,
    UpdateUser,
    DeleteUser,
    GetUserByEmail,
    CreatedUserGoogle,
    UpdateUserGoogleId,
    BlockUserFromContact,
    UnblockUserFromContact,
    GetBlockedUsers
}