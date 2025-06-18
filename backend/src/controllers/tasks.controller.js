const CrudControllerBase = require('./crud-controller.base');
const tasksStore = require('../stores/tasks.store');
const taskRunnerService = require('../services/task-runner.service');

class TasksController extends CrudControllerBase {
  constructor() {
    super('tasks', 'task', tasksStore);
  }

  registerEndpoints(router) {
    router.get(`/${ this.modelName }/running`, (req, res) => {
      this.listRunningTasks(req, res).catch((e) => this.errorHandler(e, res));
    });

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
      taskRunnerService.stopTask(taskId).catch(console.error);
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

    console.log(`Completing task ${ taskId }. Will check queue after stopping.`);
    await taskRunnerService.stopTask(taskId);
    // O processamento da próxima tarefa é feito no método stopTask

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

    taskRunnerService.stopTask(taskId).catch(console.error);

    task.status = 'backlog';
    await tasksStore.update(task.id, task);
    res.json({ success: true, message: 'Stopping task' });
  }

  async listRunningTasks(req, res) {
    const runningTaskIds = taskRunnerService.executingTasks;
    res.json(runningTaskIds);
  }

  async getByProjectId(req, res) {
    const projectId = req.params.projectId;
    const tasks = await tasksStore.getByProjectId(projectId);
    const executingTasks = taskRunnerService.executingTasks;
    const queuedTasks = taskRunnerService.taskQueue;

    tasks.forEach(t => {
      t.isExecuting = executingTasks.includes(t.id);
      t.isQueued = queuedTasks.includes(t.id);

      // Incluir posição na fila se a tarefa estiver em fila
      if (t.isQueued) {
        t.queuePosition = queuedTasks.indexOf(t.id) + 1; // Posição na fila (1-based)
      }
    });

    res.json(tasks);
  }
}

module.exports = new TasksController();
