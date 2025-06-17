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
          filter: {
            description: "Optional status filter",
            type: "string",
            enum: ["pending", "in_progress", "completed"],
          },
        }
      }
    }
  };

  async executeTool(conversation, input) {
    const taskId = conversation.taskId;
    if (!taskId) throw new Error("The taskId is required");
    const task = await tasksStore.getById(taskId);
    if (!task) throw new Error("Task not found");
    task.todo = task.todo ?? [];
    if (!input.filter) return task.todo;
    return task.todo.filter(x => x.status === input.filter);
  }
}

module.exports = new TodoReadTool();
