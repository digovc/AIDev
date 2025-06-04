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
  taskQueue = [];

  async runTask(taskId) {
    if (this.executingTasks.includes(taskId) || this.taskQueue.includes(taskId)) {
      return;
    }

    // Se já existir tarefa em execução, adiciona à fila
    if (this.executingTasks.length > 0) {
      this.taskQueue.push(taskId);
      console.log(`Task ${ taskId } added to queue. Current queue:`, this.taskQueue);
      socketIOService.io.emit('task-queued', taskId);
      return;
    }

    // Se não houver tarefas em execução, inicia esta tarefa
    await this.startTask(taskId);
  }

  async startTask(taskId) {
    this.executingTasks.push(taskId);
    const cancelationToken = this.getCancelationToken(taskId);
    this.cancelationTokens.push(cancelationToken);
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
      // Quando a tarefa terminar, verifica se há próxima na fila
      await this.processNextInQueue();
    }
  }

  getCancelationToken(taskId) {
    return new CancelationToken(taskId, () => this.stopTask(taskId));
  }

  async stopTask(taskId) {
    this.executingTasks = this.executingTasks.filter(t => t !== taskId);
    this.taskQueue = this.taskQueue.filter(t => t !== taskId);

    const cancelationTokens = this.cancelationTokens.filter(t => t.taskId === taskId);
    cancelationTokens.forEach(t => t.cancel());
    socketIOService.io.emit('task-not-executing', taskId);

    // Se a tarefa parada estava em execução, processa a próxima da fila
    await this.processNextInQueue();
  }

  async processNextInQueue() {
    // Se a fila não estiver vazia e não houver tarefas em execução
    if (this.taskQueue.length > 0 && this.executingTasks.length === 0) {
      const nextTaskId = this.taskQueue.shift(); // Remove e retorna o primeiro elemento da fila
      console.log(`Starting next task from queue: ${ nextTaskId }`);
      await this.startTask(nextTaskId);
    }
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

    // Certifica que a próxima tarefa seja processada mesmo em caso de erro
    await this.processNextInQueue();
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
