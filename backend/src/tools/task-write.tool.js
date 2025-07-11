const tasksStore = require('../stores/tasks.store');

class TaskWriteTool {
  getDefinition() {
    return {
      name: "task_write",
      description: "Adds or updates a project task",
      input_schema: {
        type: "object",
        required: ["description"],
        properties: {
          id: {
            description: "Task ID (required for update)",
            type: "string"
          },
          description: {
            description: "Detailed description of the task",
            type: "string"
          },
          status: {
            description: "Task status",
            type: "string",
            enum: [
              "backlog",
              "running",
              "done"
            ]
          }
        }
      }
    };
  }

  async executeTool(conversation, input) {
    if (input.id) {
      return this.updateTask(conversation, input);
    } else {
      return this.createTask(conversation, input);
    }
  }

  async createTask(conversation, input) {
    if (!input.description) throw new Error("To create a task the 'description' field is required");

    const task = {
      projectId: conversation.projectId,
      description: input.description ?? "",
      status: input.status || "backlog"
    };

    const taskCreated = await tasksStore.create(task);

    return {
      success: true,
      message: "Task created successfully",
      taskId: taskCreated.id
    }
  }

  async updateTask(conversation, input) {
    const task = await tasksStore.getById(input.id);
    if (!task) throw new Error("Task not found");

    task.description = task.description ?? "";

    if (input.description) task.description += `\n\n${ input.description }`;
    if (input.status) task.status = input.status;

    await tasksStore.update(input.id, task);

    return {
      success: true,
      message: "Task updated successfully"
    }
  }
}

module.exports = new TaskWriteTool();
