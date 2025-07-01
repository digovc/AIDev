const CrudControllerBase = require('./crud-controller.base');
const conversationsStore = require('../stores/conversations.store');

class ConversationsController extends CrudControllerBase {
  constructor() {
    super('conversations', 'conversation', conversationsStore);
  }

  registerEndpoints(router) {
    super.registerEndpoints(router);

    router.get(`/${ this.modelName }/project/:projectId`, (req, res) => {
      this.getByProjectId(req, res).catch((e) => this.errorHandler(e, res));
    });
  }
}

module.exports = new ConversationsController();
