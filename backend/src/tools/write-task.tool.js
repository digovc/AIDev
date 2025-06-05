const tasksStore = require('../stores/tasks.store');

class WriteTaskTool {
  getDefinition() {
    return {
      name: "write_task",
      description: "Adds or updates a project task",
      input_schema: {
        type: "object",
        required: ["title", "description"],
        properties: {
          id: {
            description: "Task ID (required for update)",
            type: "string"
          },
          title: {
            description: "Task title (required for creation)",
            type: "string"
          },
          description: {
            description: "Detailed description of the task",
            type: "string"
          },
          append_description: {
            description: "Appends text to the current task description",
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
    if (!input.title) {
      throw new Error("To create a task the 'title' field is required");
    }

    if (input.append_description) {
      input.append_description = `\n\nAssistente:\n${ input.append_description }`;
    }

    const task = {
      projectId: conversation.projectId,
      title: input.title,
      description: (input.description || "") + (input.append_description || ""),
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
    if (!input.id) {
      throw new Error("To update a task the 'id' field is required");
    }

    const task = await tasksStore.getById(input.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (input.append_description) {
      input.append_description = `\n\nAssistente:\n${ input.append_description }`;
    }

    if (input.title) task.title = input.title;
    if (input.description) task.description = input.description;
    if (input.append_description) task.description += input.append_description;
    if (input.status) task.status = input.status;

    await tasksStore.update(input.id, task);

    return {
      success: true,
      message: "Task updated successfully"
    }
  }
}

module.exports = new WriteTaskTool();
