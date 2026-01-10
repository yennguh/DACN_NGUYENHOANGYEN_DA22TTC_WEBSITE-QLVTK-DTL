import api from './axiosInterceptor';

export const fetchLoginAPI = async (payload) => {
   const request = await api.post('/v1/user/login', payload)
   return request.data;
}

export const fetchRegisterAPI = async (payload) => {
   try {
      const response = await api.post('/v1/user/register', payload);
      return response.data;
   } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data || error.message);
      return null;
   }
};

export const fetchAllUsers = async (params = {}) => {
   try {
      const response = await api.get('/v1/user/list', {
         params, // axios sẽ tự chuyển object này thành query string
      });
      return response.data;
   } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error.response?.data || error.message);
      return null;
   }
};

export const inforUser = async () => {
   try {
      const response = await api.get('/v1/user/inforUser');
      return response.data;
   } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error.response?.data || error.message);
      return null;
   }
};

export const updateUser = async (payload) => {
   try {
      // Nếu có file avatar, sử dụng FormData
      let formData;
      if (payload instanceof FormData) {
         formData = payload;
      } else if (payload.avatar instanceof File) {
         formData = new FormData();
         Object.keys(payload).forEach(key => {
            if (key === 'avatar') {
               formData.append('avatar', payload.avatar);
            } else {
               formData.append(key, payload[key]);
            }
         });
      } else {
         formData = payload;
      }

      // Khi dùng FormData, không set Content-Type header để browser tự động set với boundary
      const config = formData instanceof FormData 
         ? {} // Browser sẽ tự động set Content-Type với boundary
         : { headers: { 'Content-Type': 'application/json' } };
      
      const response = await api.put('/v1/user/updateUser', formData, config);
      return response.data;
   } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error.response?.data || error.message);
      throw error;
   }
};

export const deleteUser = async (userId) => {
   try {
      const response = await api.delete(`/v1/user/${userId}`);
      return response.data;
   } catch (error) {
      console.error("Lỗi xóa người dùng:", error.response?.data || error.message);
      throw error;
   }
};

export const googleLogin = async (credential) => {
   try {
      const response = await api.post('/v1/user/google-login', { credential });
      return response.data;
   } catch (error) {
      console.error("Lỗi đăng nhập Google:", error.response?.data || error.message);
      throw error;
   }
};

export const changePassword = async (payload) => {
   try {
      const response = await api.put('/v1/user/change-password', payload);
      return response.data;
   } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error.response?.data || error.message);
      throw error;
   }
};

export const getUserById = async (userId) => {
   try {
      const response = await api.get(`/v1/user/${userId}`);
      return response.data;
   } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error.response?.data || error.message);
      return null;
   }
};

// Block user from contact feature (Admin only)
export const blockUserFromContact = async (userId) => {
   try {
      const response = await api.patch(`/v1/user/${userId}/block-contact`);
      return response.data;
   } catch (error) {
      console.error("Lỗi chặn người dùng:", error.response?.data || error.message);
      throw error;
   }
};

// Unblock user from contact feature (Admin only)
export const unblockUserFromContact = async (userId) => {
   try {
      const response = await api.patch(`/v1/user/${userId}/unblock-contact`);
      return response.data;
   } catch (error) {
      console.error("Lỗi bỏ chặn người dùng:", error.response?.data || error.message);
      throw error;
   }
};

// Get list of blocked users (Admin only)
export const getBlockedUsers = async () => {
   try {
      const response = await api.get('/v1/user/blocked-contacts/list');
      return response.data;
   } catch (error) {
      console.error("Lỗi lấy danh sách người dùng bị chặn:", error.response?.data || error.message);
      return null;
   }
};
