import { ApiBase } from './api.base';

class MessagesApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/messages';
  }

  async getMessagesByConversationId(conversationId) {
    return this.client.get(`${ this.baseUrl }/conversation/${ conversationId }`);
  }

  async sendMessage(message) {
    return this.client.post(this.baseUrl, message);
  }
}

export const messagesApi = new MessagesApi();
