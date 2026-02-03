import api from './axiosConfig';

const ADMISSION_URL = '/api/nhapvien';

export const admissionApi = {
    getAll: async () => {
        const response = await api.get(`${ADMISSION_URL}/get-all`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${ADMISSION_URL}/get-by-id/${id}`);
        return response.data;
    },

    /**
     * Nhập viện bệnh nhân
     */
    create: async (admissionData) => {
        const response = await api.post(`${ADMISSION_URL}/create`, admissionData);
        return response.data;
    },

    /**
     * Chuyển giường
     */
    transferBed: async (nhapVienId, newBedId, reason) => {
        const response = await api.post(`${ADMISSION_URL}/transfer-bed`, {
            nhapVienId,
            giuongMoiId: newBedId,
            lyDo: reason
        });
        return response.data;
    },

    /**
     * Xuất viện
     */
    discharge: async (nhapVienId) => {
        const response = await api.post(`${ADMISSION_URL}/xuat-vien/${nhapVienId}`);
        return response.data;
    },

    /**
     * Danh sách bệnh nhân đủ điều kiện xuất viện
     */
    getReadyForDischarge: async () => {
        const response = await api.get(`${ADMISSION_URL}/ready-for-discharge`);
        return response.data;
    }
};

export default admissionApi;
