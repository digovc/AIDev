const CrudControllerBase = require('./crud-controller.base');
const assistantsStore = require('../stores/assistants.store');

class AssistantsController extends CrudControllerBase {
  constructor() {
    super('assistants', 'assistant', assistantsStore);
  }

  async list(req, res) {
    const assistants = await this.store.getAllSortedByName();
    res.json(assistants);
  }
}

module.exports = new AssistantsController();
