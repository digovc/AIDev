import { ApiBase } from './api.base.js';

export class AuthApi extends ApiBase {
  login(email, password) {
    return this.client.post('/login', { email, password });
  }
}

export const authApi = new AuthApi();