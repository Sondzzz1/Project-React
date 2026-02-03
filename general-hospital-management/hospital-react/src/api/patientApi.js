import api from './axiosConfig';

const PATIENT_URL = '/api/benhnhan';

export const patientApi = {
    /**
     * Lấy danh sách tất cả bệnh nhân
     */
    getAll: async () => {
        const response = await api.get(`${PATIENT_URL}/get-all`);
        return response.data;
    },

    /**
     * Lấy bệnh nhân theo ID
     */
    getById: async (id) => {
        const response = await api.get(`${PATIENT_URL}/get-by-id/${id}`);
        return response.data;
    },

    /**
     * Tìm kiếm bệnh nhân với pagination
     * @param {Object} params - { keyword, pageIndex, pageSize }
     */
    search: async (params) => {
        const response = await api.post(`${PATIENT_URL}/search`, {
            HoTen: params.hoTen || params.keyword || null,
            DiaChi: params.diaChi || null,
            SoTheBaoHiem: params.soTheBaoHiem || null,
            pageIndex: params.pageIndex || 1,
            pageSize: params.pageSize || 10
        });
        return response.data;
    },

    /**
     * Tạo bệnh nhân mới
     */
    create: async (patient) => {
        // Format dates
        let ngaySinhStr = '';
        if (patient.ngaySinh) {
            const date = new Date(patient.ngaySinh);
            ngaySinhStr = date.toISOString().split('T')[0];
        }

        let hanBHYTStr = null;
        if (patient.hanTheBHYT) {
            hanBHYTStr = new Date(patient.hanTheBHYT).toISOString();
        }

        const requestData = {
            hoTen: patient.hoTen || '',
            ngaySinh: ngaySinhStr,
            gioiTinh: patient.gioiTinh || '',
            diaChi: patient.diaChi || '',
            soTheBaoHiem: patient.soTheBaoHiem || '',
            mucHuong: patient.mucHuong,
            hanTheBHYT: hanBHYTStr,
            trangThai: patient.trangThai || 'Đang điều trị'
        };

        const response = await api.post(`${PATIENT_URL}/create`, requestData);
        return response.data;
    },

    /**
     * Cập nhật thông tin bệnh nhân
     */
    update: async (id, patient) => {
        let ngaySinhStr = '';
        if (patient.ngaySinh) {
            const date = new Date(patient.ngaySinh);
            ngaySinhStr = date.toISOString().split('T')[0];
        }

        let hanBHYTStr = null;
        if (patient.hanTheBHYT) {
            hanBHYTStr = new Date(patient.hanTheBHYT).toISOString();
        }

        const requestData = {
            id: id,
            hoTen: patient.hoTen || '',
            ngaySinh: ngaySinhStr,
            gioiTinh: patient.gioiTinh || '',
            diaChi: patient.diaChi || '',
            soTheBaoHiem: patient.soTheBaoHiem || '',
            mucHuong: patient.mucHuong,
            hanTheBHYT: hanBHYTStr,
            trangThai: patient.trangThai || 'Đang điều trị'
        };

        const response = await api.put(`${PATIENT_URL}/update`, requestData);
        return response.data;
    },

    /**
     * Xóa bệnh nhân
     */
    delete: async (id) => {
        const response = await api.delete(`${PATIENT_URL}/delete/${id}`);
        return response.data;
    }
};

export default patientApi;
