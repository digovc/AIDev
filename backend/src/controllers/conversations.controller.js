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

  async getByProjectId(req, res) {
    const projectId = req.params.projectId;
    const conversations = await conversationsStore.getByProjectId(projectId);
    res.json(conversations);
  }
}

module.exports = new ConversationsController();
