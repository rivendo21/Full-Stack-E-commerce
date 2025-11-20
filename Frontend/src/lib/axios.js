import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://full-stack-e-commerce-2-upln.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
