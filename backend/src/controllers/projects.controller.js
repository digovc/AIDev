const CrudControllerBase = require('./crud-controller.base');
const projectsStore = require('../stores/projects.store');

class ProjectsController extends CrudControllerBase {
  constructor() {
    super('projects', 'project', projectsStore);
  }

  async list(req, res) {
    const assistants = await this.store.getAllSortedByName();
    res.json(assistants);
  }
}

module.exports = new ProjectsController();
