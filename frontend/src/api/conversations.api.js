import { ApiBase } from './api.base';

class ConversationsApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/conversations';
  }

  getById(id) {
    return this.client.get(`${ this.baseUrl }/${ id }`);
  }

  async getConversationsByProjectId(projectId) {
    return this.client.get(`${ this.baseUrl }/project/${ projectId }`);
  }

  async createConversation(projectId) {
    return this.client.post(this.baseUrl, { projectId });
  }

  async sendMessage(conversationId, messageData) {
    return this.client.post(`${ this.baseUrl }/${ conversationId }/messages`, messageData);
  }
}

export const conversationsApi = new ConversationsApi();
