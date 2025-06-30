const CancelationToken = require("./cancelation.token");
const agentService = require('./agent.service');
const conversationsStore = require('../stores/conversations.store');
const messagesStore = require('../stores/messages.store');
const projectsStore = require('../stores/projects.store');
const promptParserService = require('./prompt-parser.service');
const socketIOService = require("./socket-io.service");
const tasksStore = require('../stores/tasks.store');

class TaskRunnerService {
  executingTasks = [];
  cancelationTokens = [];

  async runTask(taskId) {
    // Verifica se a tarefa já está em execução ou na fila
    if (this.executingTasks.includes(taskId)) return;

    // Inicia a tarefa diretamente (permite execução paralela)
    await this.startTask(taskId);
  }

  async startTask(taskId) {
    // Adiciona a tarefa à lista de execução
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
    } finally {
      // Remove a tarefa da lista de execução quando completa
      await this.taskCompletion(taskId);
    }
  }

  getCancelationToken(taskId) {
    const oldCancelationToken = this.cancelationTokens.find(t => t.taskId === taskId);
    if (oldCancelationToken) {
      oldCancelationToken.reset();
      return oldCancelationToken;
    }
    const cancelationToken = new CancelationToken(taskId, () => this.stopTask(taskId));
    this.cancelationTokens.push(cancelationToken);
    return cancelationToken;
  }

  async stopTask(taskId) {
    this.executingTasks = this.executingTasks.filter(t => t !== taskId);

    const cancelationTokens = this.cancelationTokens.filter(t => t.taskId === taskId);
    cancelationTokens.forEach(t => t.cancel());

    const task = await tasksStore.getById(taskId);
    task.status = 'backlog';
    await tasksStore.update(task.id, task);

    socketIOService.io.emit('task-not-executing', taskId);
  }

  async taskCompletion(taskId) {
    // Remove a tarefa da lista de execução
    this.executingTasks = this.executingTasks.filter(t => t !== taskId);
    console.log(`Task ${ taskId } completed. Remaining executing tasks:`, this.executingTasks);
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
    const runTaskPrompt = './assets/prompts/task.md';
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
