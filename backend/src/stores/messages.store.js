const StoreBase = require('./store.base');
const conversationsStore = require('./conversations.store');

class MessagesStore extends StoreBase {
  constructor() {
    super('messages', 'message');
  }

  async prepareBeforeSave(message) {
    await super.prepareBeforeSave(message);

    const conversation = await conversationsStore.getById(message.conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages = conversation.messages || [];

    if (!conversation.messages.includes(message.id)) {
      conversation.messages.push(message.id);
      await conversationsStore.update(conversation.id, conversation);
    }
  }

  async delete(id) {
    const message = await this.getById(id);
    if (!message) return false;

    const conversation = await conversationsStore.getById(message.conversationId);
    if (conversation) {
      conversation.messages = conversation.messages.filter(msgId => msgId !== id);
      await conversationsStore.update(conversation.id, conversation);
    }

    await super.delete(id);
  }

  async getByConversationId(conversationId) {
    const conversation = await conversationsStore.getById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = [];

    for (const messageId of conversation.messages ?? []) {
      const message = await this.getById(messageId);
      if (message) {
        messages.push(message);
      }
    }

    return messages;
  }
}

module.exports = new MessagesStore();
