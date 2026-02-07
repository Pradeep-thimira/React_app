import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchAnalysis = async (file, metric) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metric', metric);

    const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};