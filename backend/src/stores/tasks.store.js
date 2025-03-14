const StoreBase = require('./store.base');
const projectsStore = require("./projects.store");

class TasksStore extends StoreBase {
  constructor() {
    super('tasks', 'task');
  }

  async prepareBeforeSave(task) {
    await super.prepareBeforeSave(task);
    const project = await projectsStore.getById(task.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    project.tasks = project.tasks || [];

    if (!project.tasks.includes(task.id)) {
      project.tasks.push(task.id);
      await projectsStore.update(project.id, project);
    }
  }

  async getByProjectId(projectId, status = null) {
    const project = await projectsStore.getById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const tasks = [];

    for (const taskId of project.tasks ?? []) {
      const task = await this.getById(taskId);
      if (task && (status === null || task.status === status)) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  async archiveTasks(projectId, taskIds) {
    const project = await projectsStore.getById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const archivedTasks = [];

    for (const taskId of taskIds) {
      const task = await this.getById(taskId);

      if (!task) {
        throw new Error(`Task ${ taskId } not found`);
      }

      // Remover o ID da tarefa da lista de tarefas do projeto
      project.tasks = project.tasks.filter(id => id !== taskId);

      // Atualizar status da tarefa para 'archived'
      task.status = 'archived';

      // Atualizar a tarefa e o projeto
      await this.update(taskId, task);

      archivedTasks.push(task);
    }

    await projectsStore.update(projectId, project);
    return archivedTasks;
  }
}

module.exports = new TasksStore();
