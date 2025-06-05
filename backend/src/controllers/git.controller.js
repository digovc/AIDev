const gitService = require('../services/git.service');

class GitController {
  registerEndpoints(router) {
    router.get('/git/files/:taskId', (req, res) => {
      this.getFilesChanged(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.get('/git/versions/:taskId/:b64Path', (req, res) => {
      this.getContentVersions(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.get('/git/branches/:taskId', (req, res) => {
      this.getRemoteBranches(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.post('/git/push/:taskId', (req, res) => {
      this.pushChanges(req, res).catch((e) => this.errorHandler(e, res));
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

  async getContentVersions(req, res) {
    const { taskId, b64Path } = req.params;
    const filePath = Buffer.from(b64Path, 'base64').toString('utf8');
    const versions = await gitService.getContentVersions(taskId, filePath);
    res.json(versions);
  }

  async getRemoteBranches(req, res) {
    const taskId = req.params.taskId;
    try {
      const branches = await gitService.getRemoteBranches(taskId);
      res.json(branches);
    } catch (error) {
      this.errorHandler(error, res);
    }
  }

  async pushChanges(req, res) {
    const taskId = req.params.taskId;
    try {
      await gitService.pushChanges(taskId);
      res.status(200).send({ success: true });
    } catch (error) {
      this.errorHandler(error, res);
    }
  }
}

module.exports = new GitController();
