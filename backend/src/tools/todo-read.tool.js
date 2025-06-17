const tasksStore = require('../stores/tasks.store');
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

class TodoReadTool {
  DESCRIPTION = readFileSync(join(__dirname, "./todo-read.txt"), "utf8");

  getDefinition() {
    return {
      name: "todoRead",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        properties: {
          none: {
            description: "This parameter is not used",
            type: "string"
          }
        }
      }
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
