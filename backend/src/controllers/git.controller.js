const gitService = require('../services/git.service');

class GitController {
  registerEndpoints(router) {
    router.get(`/git/diff/:projectId`, async (req, res) => {
      try {
        const { projectId } = req.params;
        const diff = await gitService.getProjectDiff(projectId);
        res.json(diff);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
}

module.exports = new GitController();
