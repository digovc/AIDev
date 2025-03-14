const StoreBase = require('./store.base');

class ProjectsStore extends StoreBase {
  constructor() {
    super('projects', 'project');
  }
}

module.exports = new ProjectsStore();
