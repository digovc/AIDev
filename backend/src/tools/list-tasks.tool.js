const tasksStore = require('../stores/tasks.store');

class ListTasksTool {
  getDefinition() {
    return {
      name: "list_tasks",
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
    if (input.status) {
      return await tasksStore.getByProjectId(conversation.projectId, input.status);
    }

    return await tasksStore.getByProjectId(conversation.projectId);
  }
}

module.exports = new ListTasksTool();
