const StoreBase = require('./store.base');

class ConversationsStore extends StoreBase {
  constructor() {
    super('conversations', 'conversation');
  }
}

module.exports = new ConversationsStore();
