const CrudControllerBase = require('./crud-controller.base');
const tasksStore = require('../stores/tasks.store');
const taskRunnerService = require('../services/task-runner.service');

class TasksController extends CrudControllerBase {
  constructor() {
    super('tasks', 'task', tasksStore);
  }

  registerEndpoints(router) {
    super.registerEndpoints(router);

    router.get(`/${ this.modelName }/project/:projectId`, (req, res) => {
      this.getByProjectId(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.post(`/${ this.modelName }/run/:taskId`, (req, res) => {
      this.runTask(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.post(`/${ this.modelName }/stop/:taskId`, (req, res) => {
      this.stopTask(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.post(`/${ this.modelName }/complete/:taskId`, (req, res) => {
      this.completeTask(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.post(`/${ this.modelName }/archive`, (req, res) => {
      this.archiveTasks(req, res).catch((e) => this.errorHandler(e, res));
    });
  }

  async runTask(req, res) {
    const taskId = req.params.taskId;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    taskRunnerService.runTask(taskId).catch(console.error);
    res.json({ success: true, message: 'Running task' });
  }

  async archiveTasks(req, res) {
    const { projectId, taskIds } = req.body;

    if (!projectId || !taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const archivedTasks = await tasksStore.archiveTasks(projectId, taskIds);

    for (const taskId of taskIds) {
      taskRunnerService.stopTask(taskId);
    }

    res.json({ success: true, archivedTasks });
  }

  async completeTask(req, res) {
    const taskId = req.params.taskId;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const task = await tasksStore.getById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = 'done';
    await tasksStore.update(task.id, task);
    await taskRunnerService.stopTask(taskId);
    res.json({ success: true, message: 'Task completed', task });
  }

  async stopTask(req, res) {
    const taskId = req.params.taskId;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    const task = await tasksStore.getById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    taskRunnerService.stopTask(taskId);
    task.status = 'backlog';

    await tasksStore.update(task.id, task);
    res.json({ success: true, message: 'Stopping task' });
  }

  async getByProjectId(req, res) {
    const projectId = req.params.projectId;
    const tasks = await tasksStore.getByProjectId(projectId);
    const executingTasks = taskRunnerService.executingTasks;
    tasks.forEach(t => t.isExecuting = executingTasks.includes(t.id));
    res.json(tasks);
  }
}

module.exports = new TasksController();
