const promptParserService = require('./prompt-parser.service');
const tasksStore = require('../stores/tasks.store');
const agentService = require('./agent.service');
const conversationsStore = require('../stores/conversations.store');
const messagesStore = require('../stores/messages.store');
const projectsStore = require('../stores/projects.store');
const socketIOService = require("./socket-io.service");
const CancelationToken = require("./cancelation.token");

class TaskRunnerService {
  executingTasks = [];

  async runTask(taskId) {
    if (this.executingTasks.includes(taskId)) {
      return;
    }

    this.executingTasks.push(taskId);
    const cancelationToken = this.getCancelationToken(taskId);
    socketIOService.io.emit('task-executing', taskId);

    const task = await tasksStore.getById(taskId);
    task.status = 'running';
    await tasksStore.update(task.id, task);
    const conversation = await this.getTaksConversation(task);

    if (!conversation.messages.length) {
      await this.createSystemMessage(task, conversation);
    }

    try {
      await agentService.sendMessage(conversation, cancelationToken, task);
    } catch (error) {
      await this.logError(task, conversation, cancelationToken, error);
    }
  }

  getCancelationToken(taskId) {
    return new CancelationToken(taskId, () => this.stopTask(taskId));
  }

  stopTask(taskId) {
    this.executingTasks = this.executingTasks.filter(t => t !== taskId);
    socketIOService.io.emit('task-not-executing', taskId);
  }

  async logError(task, conversation, cancelationToken, error) {
    const errorMessage = {
      id: new Date().getTime(),
      conversationId: conversation.id,
      sender: 'log',
      timestamp: new Date().toISOString(),
      blocks: [{ type: 'text', content: `Erro ao executar a tarefa: ${ error.message }` }]
    }

    await messagesStore.create(errorMessage);
    cancelationToken.cancel();
  }

  async getTaksConversation(task) {
    if (task.conversationId) {
      return await conversationsStore.getById(task.conversationId);
    } else {
      return this.createTaskConversation(task);
    }
  }

  async createTaskConversation(task) {
    const conversation = {
      projectId: task.projectId,
      taskId: task.id,
      assistantId: task.assistantId,
      messages: [],
    };

    const createdConversation = await conversationsStore.create(conversation);
    task.conversationId = createdConversation.id;
    await tasksStore.update(task.id, task);
    return createdConversation;
  }

  async createSystemMessage(task, conversation) {
    const project = await projectsStore.getById(task.projectId);
    const runTaskPrompt = './assets/prompts/run-task.md';
    const systemPrompt = await promptParserService.parsePrompt(runTaskPrompt, { project, task });
    const now = new Date();

    const systemMessage = {
      id: `${ now.getTime() }`,
      conversationId: conversation.id,
      sender: 'user_system',
      timestamp: now.toISOString(),
      blocks: [{ id: `${ now.getTime() + 1 }`, type: 'text', content: systemPrompt }]
    };

    await messagesStore.create(systemMessage);
  }
}

module.exports = new TaskRunnerService();
