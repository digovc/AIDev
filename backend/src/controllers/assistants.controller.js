const CrudControllerBase = require('./crud-controller.base');
const assistantsStore = require('../stores/assistants.store');

class AssistantsController extends CrudControllerBase {
  constructor() {
    super('assistants', 'assistant', assistantsStore);
  }
}

module.exports = new AssistantsController();
