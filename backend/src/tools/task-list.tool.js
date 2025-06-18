const tasksStore = require('../stores/tasks.store');

class TaskListTool {
  getDefinition() {
    return {
      name: "taskList",
      description: "Lists the tasks of the project",
      input_schema: {
        type: "object",
        properties: {
          status: {
            description: "Filter by task status",
            type: "string",
            enum: [
              "backlog",
              "running"
            ],
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    input.status = input.status ?? '';

    if (!['', 'backlog', 'running'].includes(input.status)) {
      throw new Error("Invalid status. Must be empty, backlog or running");
    }

    if (['backlog', 'running'].includes(input.status)) {
      return await tasksStore.getByProjectId(conversation.projectId, input.status);
    }

    const backlogTasks = await tasksStore.getByProjectId(conversation.projectId, 'backlog');
    const runningTasks = await tasksStore.getByProjectId(conversation.projectId, 'running');

    return backlogTasks.concat(runningTasks);
  }
}

module.exports = new TaskListTool();
