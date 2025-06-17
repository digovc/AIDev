const socketIOService = require('./socket-io.service');

class WorkerManager {
  constructor() {
    // Map of taskId -> Set of active conversationIds
    this.activeWorkers = new Map();
  }
  workerStarted(conversation) {
    const { taskId, id: conversationId } = conversation;
    // track active worker sessions
    if (!this.activeWorkers.has(taskId)) {
      this.activeWorkers.set(taskId, new Set());
    }
    this.activeWorkers.get(taskId).add(conversationId);
    socketIOService.io.emit('worker-started', {
      taskId: conversation.taskId,
      conversationId: conversation.id,
      timestamp: new Date().toISOString(),
    });
  }

  workerRunning(conversation) {
    socketIOService.io.emit('worker-running', {
      taskId: conversation.taskId,
      conversationId: conversation.id,
      timestamp: new Date().toISOString(),
    });
  }

  workerFinished(conversation) {
    const { taskId, id: conversationId } = conversation;
    // remove from active worker sessions
    if (this.activeWorkers.has(taskId)) {
      const set = this.activeWorkers.get(taskId);
      set.delete(conversationId);
      if (set.size === 0) {
        this.activeWorkers.delete(taskId);
      }
    }
    socketIOService.io.emit('worker-finished', {
      taskId: conversation.taskId,
      conversationId: conversation.id,
      timestamp: new Date().toISOString(),
    });
  }

  workerSessionMessagesCount(conversation, count) {
    socketIOService.io.emit('worker-session-messages-count', {
      taskId: conversation.taskId,
      conversationId: conversation.id,
      count,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new WorkerManager();
