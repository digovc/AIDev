const repositoryWatcherService = require('../services/repository-watcher.service');
const path = require('path');
const projectsStore = require('../stores/projects.store');

class ReferencesController {
  constructor() {
    this.baseUrl = '/references';
  }

  registerEndpoints(router) {
    router.get(`${ this.baseUrl }/search/project/:projectId`, (req, res) => {
      this.search(req, res).catch((e) => this.errorHandler(e, res));
    });
  }

  async search(req, res) {
    const projectId = req.params.projectId;
    const project = await projectsStore.getById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
      const results = repositoryWatcherService.searchFiles(project.path, query);

      // Formata os resultados para retornar apenas os caminhos relativos
      const formattedResults = results.map(filePath => ({
        name: path.basename(filePath),
        path: path.relative(project.path, filePath)
      }));

      res.json(formattedResults);
    } catch (error) {
      console.error('Error searching references:', error);
      res.status(500).json({ error: 'Failed to search references' });
    }
  }

  errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
}

module.exports = new ReferencesController();
