import { ApiBase } from './api.base';

export class GitApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/git';
  }

  async getFilesChanged(taskId) {
    return this.client.get(`${this.baseUrl}/files/${taskId}`);
  }

  async getContentVersions(taskId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.get(`${this.baseUrl}/versions/${taskId}/${b64Path}`);
  }
}

export const gitApi = new GitApi();
