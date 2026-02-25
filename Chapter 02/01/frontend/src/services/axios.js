import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 5000,
});

export const fetchWelcomeMessage = async () => {
  try {
    const response = await axiosInstance.get('welcome/');
    return response.data;
  } catch (error) {
    console.error('Error fetching welcome message:', error);
    throw error;
  }
};

export default axiosInstance;
