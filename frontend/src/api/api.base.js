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
  }
}
