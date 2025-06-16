const CrudControllerBase = require('./crud-controller.base');
const messagesStore = require('../stores/messages.store');
const conversationsStore = require('../stores/conversations.store');
const agentService = require('../services/agent.service');
const taskRunnerService = require('../services/task-runner.service');

class MessagesController extends CrudControllerBase {
  constructor() {
    super('messages', 'message', messagesStore);
  }

  registerEndpoints(router) {
    super.registerEndpoints(router);

    router.get(`/${ this.modelName }/conversation/:conversationId`, (req, res) => {
      this.getByConversationId(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.delete(`/${ this.modelName }/:id`, (req, res) => {
      this.deleteMessage(req, res).catch((e) => this.errorHandler(e, res));
    });
  }

  async getByConversationId(req, res) {
    const conversationId = req.params.conversationId;
    const messages = await messagesStore.getByConversationId(conversationId);
    res.json(messages);
  }

  async create(req, res) {
    const message = req.body;
    await this.store.create(message);
    const conversation = await conversationsStore.getById(message.conversationId);

    if (conversation.taskId) {
      await taskRunnerService.runTask(conversation.taskId);
    } else {
      await agentService.continueConversation(conversation);
    }

    res.status(201).json(message);
  }

  async deleteMessage(req, res) {
    const messageId = req.params.id;
    await this.store.delete(messageId);
    res.status(200).json({ success: true });
  }
}

module.exports = new MessagesController();
