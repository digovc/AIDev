import { ApiBase } from './api.base';

export class SettingsApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/settings';
  }

  async getSettings() {
    return this.client.get(this.baseUrl);
  }

  async saveSettings(settingsData) {
    return this.client.post(this.baseUrl, settingsData);
  }
}

export const settingsApi = new SettingsApi();
