import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchAnalysis = async (location, metric) => {
    const response = await axios.post(`${API_URL}/analyze`, {
        location,
        metric
    });
    return response.data;
};