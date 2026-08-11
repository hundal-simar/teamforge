import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (err) {
        
        window.dispatchEvent(new Event('auth:sessionExpired'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;