import axios from 'axios';

export class ApiBase {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor to handle 401 Unauthorized and redirect to login
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login page
          sessionStorage.removeItem('authToken');
          window.location.href = '/#/login';
        }
        return Promise.reject(error);
      }
    );
  }
}
