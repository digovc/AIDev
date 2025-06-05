import { ApiBase } from './api.base';

export class FilesApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/files';
  }

  async getFileContent(taskId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.get(`${ this.baseUrl }/content/${ taskId }/${ b64Path }`);
  }
}

export const filesApi = new FilesApi();
