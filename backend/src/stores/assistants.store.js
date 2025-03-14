const StoreBase = require('./store.base');

class AssistantsStore extends StoreBase {
  constructor() {
    super('assistants', 'assistant');
  }

  async prepareBeforeSave(assistant) {
    await super.prepareBeforeSave(assistant);

    // Definir título padrão caso não seja fornecido
    assistant.title = assistant.title || `Assistant ${ assistant.id }`;
  }
}

module.exports = new AssistantsStore();
