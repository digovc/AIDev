const tasksStore = require('../stores/tasks.store');
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const socketIOService = require('../services/socket-io.service');

class TodoWriteTool {
  DESCRIPTION = readFileSync(join(__dirname, "./todo-write.txt"), "utf8");

  getDefinition() {
    return {
      name: "todoWrite",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            description: "List of todo items to add or update",
            type: "array",
            items: {
              type: "object",
              required: ["id", "status"],
              properties: {
                id: {
                  type: "string",
                  description: "Unique identifier for the todo item"
                },
                content: {
                  type: "string",
                  description: "Brief description of the task"
                },
                status: {
                  type: "string",
                  enum: ["pending", "in_progress", "completed"],
                  description: "Current status of the task (default: pending)"
                }
              }
            }
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    if (!input.items?.length) throw new Error("The parameter items is required");
    if (!input.items.every(x => x.id)) throw new Error("All items must have an id");

    const taskId = conversation.taskId;
    if (!taskId) throw new Error("The taskId is required");
    const task = await tasksStore.getById(taskId);
    if (!task) throw new Error("Task not found");
    task.todo = task.todo ?? [];

    for (const item of input.items) {
      const existingItem = task.todo.find(i => i.id === item.id);

      if (existingItem) {
        existingItem.status = item.status;
      } else {
        task.todo.push({
          id: item.id,
          content: item.content,
          status: item.status,
        });
      }
    }

    await tasksStore.update(taskId, task);
    socketIOService.io.emit('todo-updated', { taskId });

    return {
      success: true,
      message: `Todo list updated successfully.`
    };
  }
}

module.exports = new TodoWriteTool();
