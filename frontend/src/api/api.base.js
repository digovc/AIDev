import axios from 'axios';

export class ApiBase {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    });
  }
}
