import { ApiBase } from './api.base';

export class FilesApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/files';
  }

  async getFileContent(projectId, filePath) {
    const b64Path = btoa(filePath);
    return this.client.get(`${ this.baseUrl }/content/${ projectId }/${ b64Path }`);
  }
}

export const filesApi = new FilesApi();
