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
              "running",
              "done"
            ],
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    return await tasksStore.getByProjectId(conversation.projectId, input.status);
  }
}

module.exports = new TaskListTool();
