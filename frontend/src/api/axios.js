import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  response=> response,
  async (error)=>{
    const originalRequest = error.config;
    if(error.response.status === 401 && !originalRequest._retry){
      originalRequest._retry = true;
      try{
        await api.get("/auth/refresh");
        return api(originalRequest);
      }catch(err){
        return Promise.reject(err);
      }
    }
  }
);

export default api;