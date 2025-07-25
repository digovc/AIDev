const workerService = require("../services/worker.service");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const tasksStore = require("../stores/tasks.store");
const { v4: uuidv4 } = require('uuid');

class WorkerTool {
  DESCRIPTION = readFileSync(join(__dirname, "./worker.txt"), "utf8");

  getDefinition() {
    return {
      name: "worker",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: {
            type: "string",
            description: "The prompt to send to the worker"
          }
        }
      }
    }
  };

  async executeTool(conversation, input, cancelationToken) {
    cancelationToken.throwIfCanceled();
    if (!input.prompt) throw new Error("The parameter prompt is required");
    if (!conversation?.taskId) throw new Error("Conversation has no task");
    let task = await tasksStore.getById(conversation.taskId);
    if (!task) throw new Error("Task not found");

    let worker = {
      prompt: input.prompt,
      id: uuidv4(),
      taskId: conversation.taskId,
      status: 'running',
      messagesCount: 0,
    }

    task.workers = task.workers ?? [];
    task.workers.push(worker);
    await tasksStore.update(task.id, task);
    let status = 'completed';
    let result = {};

    try {
      result = await workerService.job(conversation, input.prompt, worker, cancelationToken);
      return result;
    } catch (error) {
      status = 'failed';
      task = await tasksStore.getById(task.id);
      worker = task.workers.find(w => w.id === worker.id);

      worker.status = 'finished';
      worker.error = true;
      worker.report = error.message;

      throw new Error(`Error on worker: ${ error }`);
    } finally {
      task = await tasksStore.getById(task.id);
      worker = task.workers.find(w => w.id === worker.id);

      worker.status = status;
      worker.report = result.report;

      await tasksStore.update(task.id, task);
    }
  }
}

module.exports = new WorkerTool();
