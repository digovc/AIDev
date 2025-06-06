const gitService = require('../services/git.service');

class GitController {
  registerEndpoints(router) {
    router.get('/git/files/:taskId', (req, res) => {
      this.getFilesChanged(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.get('/git/versions/:taskId/:b64Path', (req, res) => {
      this.getContentVersions(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.get('/git/branches/:taskId', (req, res) => {
      this.getRemoteBranches(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.post('/git/checkout/:taskId/:branch', (req, res) => {
      this.checkout(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.post('/git/rollback/:taskId/:b64Path', (req, res) => {
      this.rollback(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.delete('/git/delete/:taskId/:b64Path', (req, res) => {
      this.deleteFile(req, res).catch((e) => this._errorHandler(e, res));
    });

    router.post('/git/push/:taskId', (req, res) => {
      this.pushChanges(req, res).catch((e) => this._errorHandler(e, res));
    });
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
    const branches = await gitService.getRemoteBranches(taskId);
    res.json(branches);
  }

  async checkout(req, res) {
    const taskId = req.params.taskId;
    const branch = req.params.branch;
    await gitService.checkout(taskId, branch);
    res.status(200).send({ success: true });
  }

  async pushChanges(req, res) {
    const taskId = req.params.taskId;
    await gitService.pushChanges(taskId);
    res.status(200).send({ success: true });
  }

  async rollback(req, res) {
    const { taskId, b64Path } = req.params;
    const filePath = Buffer.from(b64Path, 'base64').toString('utf8');
    await gitService.rollback(taskId, filePath);
    res.status(200).send({ success: true });
  }

  async deleteFile(req, res) {
    const { taskId, b64Path } = req.params;
    const filePath = Buffer.from(b64Path, 'base64').toString('utf8');
    await gitService.deleteFile(taskId, filePath);
    res.status(200).send({ success: true });
  }

  _errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
}

module.exports = new GitController();
