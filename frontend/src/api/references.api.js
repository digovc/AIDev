import { ApiBase } from './api.base';

export class ReferencesApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/references';
  }

  async search(projectId, query) {
    return this.client.get(`${this.baseUrl}/search/project/${projectId}`, {
      params: { query }
    });
  }
}

export const referencesApi = new ReferencesApi();
