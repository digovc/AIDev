const gitService = require('../services/git.service');

class GitController {
  registerEndpoints(router) {
    router.get('/git/files/:taskId', (req, res) => {
      this.getFilesChanged(req, res).catch((e) => this.errorHandler(e, res));
    });
  }

  errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }

  async getFilesChanged(req, res) {
    const taskId = req.params.taskId;
    const files = await gitService.getFilesChanged(taskId);
    res.json(files);
  }
}

module.exports = new GitController();
