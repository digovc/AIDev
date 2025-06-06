import { ApiBase } from './api.base';

export class GitApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/git';
  }

  async getFilesChanged(taskId) {
    return this.client.get(`${ this.baseUrl }/files/${ taskId }`);
  }

  async getContentVersions(taskId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.get(`${ this.baseUrl }/versions/${ taskId }/${ b64Path }`);
  }

  async getRemoteBranches(taskId) {
    return this.client.get(`${ this.baseUrl }/branches/${ taskId }`)
  }

  async pushChanges(taskId) {
    return this.client.post(`${ this.baseUrl }/push/${ taskId }`);
  }

  async rollback(taskId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.post(`${ this.baseUrl }/rollback/${ taskId }/${ b64Path }`);
  }

  async deleteFile(taskId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.delete(`${ this.baseUrl }/delete/${ taskId }/${ b64Path }`);
  }

  async checkout(branch) {
    return this.client.post(`${ this.baseUrl }/checkout/${ branch }`);
  }
}

export const gitApi = new GitApi();
