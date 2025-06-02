const tasksStore = require('../stores/tasks.store');

class WriteTaskTool {
  getDefinition() {
    return {
      name: "write_task",
      description: "Adiciona ou atualiza uma tarefa do projeto",
      input_schema: {
        type: "object",
        required: ["title", "description"],
        properties: {
          id: {
            description: "ID da tarefa (obrigatório para atualização)",
            type: "string"
          },
          title: {
            description: "Título da tarefa (obrigatório para criação)",
            type: "string"
          },
          description: {
            description: "Descrição detalhada da tarefa",
            type: "string"
          },
          appendDescription: {
            description: "Adiciona texto à descrição atual da tarefa",
            type: "string"
          },
          status: {
            description: "Status da tarefa",
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
    // Mantém compatibilidade retroativa, direcionando para o método adequado
    if (input.id) {
      return this.updateTask(conversation, input);
    } else {
      return this.createTask(conversation, input);
    }
  }

  async createTask(conversation, input) {
    if (!input.title) {
      throw new Error("Para criar uma tarefa, o campo 'title' é obrigatório");
    }

    if (input.appendDescription) {
      input.appendDescription = `\n\nAssistente:\n${ input.appendDescription }`;
    }

    const task = {
      projectId: conversation.projectId,
      title: input.title,
      description: (input.description || "") + (input.appendDescription || ""),
      status: input.status || "backlog"
    };

    const taskCreated = await tasksStore.create(task);

    return {
      success: true,
      message: "Tarefa criada com sucesso",
      taskId: taskCreated.id
    }
  }

  async updateTask(conversation, input) {
    if (!input.id) {
      throw new Error("Para atualizar uma tarefa, o campo 'id' é obrigatório");
    }

    const task = await tasksStore.getById(input.id);
    if (!task) {
      throw new Error("Tarefa não encontrada");
    }

    if (input.appendDescription) {
      input.appendDescription = `\n\nAssistente:\n${ input.appendDescription }`;
    }

    if (input.title) task.title = input.title;
    if (input.description) task.description = input.description;
    if (input.appendDescription) task.description += input.appendDescription;
    if (input.status) task.status = input.status;

    await tasksStore.update(input.id, task);

    return {
      success: true,
      message: "Tarefa atualizada com sucesso"
    }
  }
}

module.exports = new WriteTaskTool();
