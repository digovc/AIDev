const tasksStore = require('../stores/tasks.store');

class ListTasksTool {
  getDefinition() {
    return {
      name: "list_tasks",
      description: "Lista as tarefas do projeto",
      input_schema: {
        type: "object",
        properties: {
          status: {
            description: "Filtro por status da tarefa",
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
