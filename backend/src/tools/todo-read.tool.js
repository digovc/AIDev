const tasksStore = require('../stores/tasks.store');
const DESCRIPTION = require('./todo-read.txt');

class TodoReadTool {
  getDefinition() {
    return {
      name: "todoRead",
      description: DESCRIPTION,
    }
  };

  async executeTool(conversation, input) {
    const taskId = conversation.taskId;
    if (!taskId) throw new Error("The taskId is required");
    const task = await tasksStore.getById(taskId);
    if (!task) throw new Error("Task not found");
    return task.todo ?? [];
  }
}

module.exports = new TodoReadTool();
