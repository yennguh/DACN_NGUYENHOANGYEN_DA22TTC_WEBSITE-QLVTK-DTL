import axiosInstance from './axiosInterceptor';

export const createReport = async (data) => {
    const response = await axiosInstance.post('/v1/reports', data);
    return response.data;
};

export const fetchReports = async (params = {}) => {
    const response = await axiosInstance.get('/v1/reports', { params });
    return response.data;
};

export const fetchReportById = async (id) => {
    const response = await axiosInstance.get(`/v1/reports/${id}`);
    return response.data;
};

export const updateReport = async (id, data) => {
    const response = await axiosInstance.put(`/v1/reports/${id}`, data);
    return response.data;
};

export const deleteReport = async (id) => {
    const response = await axiosInstance.delete(`/v1/reports/${id}`);
    return response.data;
};

export const countPendingReports = async () => {
    const response = await axiosInstance.get('/v1/reports/count-pending');
    return response.data;
};
