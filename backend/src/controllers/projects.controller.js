const CrudControllerBase = require('./crud-controller.base');
const projectsStore = require('../stores/projects.store');
const repositoryWatcherService = require('../services/repository-watcher.service');

class ProjectsController extends CrudControllerBase {
  constructor() {
    super('projects', 'project', projectsStore);
  }

  async list(req, res) {
    const assistants = await this.store.getAllSortedByName();
    res.json(assistants);
  }


  async get(req, res) {
    const project = await this.store.getById(req.params.id);

    if (project) {
      repositoryWatcherService.watch(project.path);
    }

    await super.get(req, res);
  }
}

module.exports = new ProjectsController();
