const filesService = require('../services/files.service');

class FilesController {
  registerEndpoints(router) {
    router.get('/files/content/:projectId/:b64Path', (req, res) => {
      this.getFileContent(req, res).catch((e) => this._errorHandler(e, res));
    });
  }

  async getFileContent(req, res) {
    const { projectId, b64Path } = req.params;
    const filePath = Buffer.from(b64Path, 'base64').toString('utf8');
    const content = await filesService.getFileContent(projectId, filePath);
    res.json(content);
  }

  _errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
}

module.exports = new FilesController();
