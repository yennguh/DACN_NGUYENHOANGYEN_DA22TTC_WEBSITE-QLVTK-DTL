import { CONTACTMODEL } from "../models/contactModel.js";
import { userServices } from "./userServices.js";

const createContact = async (payload) => {
    try {
        const result = await CONTACTMODEL.createContact(payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const getContacts = async (params) => {
    try {
        const result = await CONTACTMODEL.findContacts(params);
        
        // Populate user info (avatar) for contacts that have userId
        if (result.data && result.data.length > 0) {
            const populatedData = await Promise.all(
                result.data.map(async (contact) => {
                    if (contact.userId) {
                        try {
                            const userInfo = await userServices.GetUserInfor(contact.userId);
                            if (userInfo) {
                                return {
                                    ...contact,
                                    userAvatar: userInfo.avatar || null,
                                    userFullname: userInfo.fullname || contact.name
                                };
                            }
                        } catch (err) {
                            console.log('Error fetching user info for contact:', err);
                        }
                    }
                    return contact;
                })
            );
            result.data = populatedData;
        }
        
        return result;
    } catch (error) {
        throw error;
    }
};

const getContactById = async (id) => {
    try {
        const result = await CONTACTMODEL.findContactById(id);
        return result;
    } catch (error) {
        throw error;
    }
};

const updateContact = async (id, payload) => {
    try {
        const result = await CONTACTMODEL.updateContact(id, payload);
        return result;
    } catch (error) {
        throw error;
    }
};

const addReply = async (contactId, replyData) => {
    try {
        const result = await CONTACTMODEL.addReply(contactId, replyData);
        return result;
    } catch (error) {
        throw error;
    }
};

const getContactByUserId = async (userId) => {
    try {
        const result = await CONTACTMODEL.getContactByUserId(userId);
        return result;
    } catch (error) {
        throw error;
    }
};

export const contactServices = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    addReply,
    getContactByUserId
};

