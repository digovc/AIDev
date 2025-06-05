import { ApiBase } from './api.base';

export class GitApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/git';
  }

  async getFilesChanged(taskId) {
    return this.client.get(`${ this.baseUrl }/files/${ taskId }`);
  }
}

export const gitApi = new GitApi();
