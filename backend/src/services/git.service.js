const { exec } = require('child_process');
const projectsStore = require('../stores/projects.store');

class GitService {
  async getProjectDiff(projectId) {
    try {
      // Fetch the project by ID
      const project = await projectsStore.getById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      // Get the project path
      const projectPath = project.path;

      if (!projectPath) {
        throw new Error('Project path not defined');
      }

      // Execute git diff command
      return new Promise((resolve, reject) => {
        exec(
          'git diff',
          { cwd: projectPath },
          (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`Failed to get git diff: ${ stderr || error.message }`));
            } else {
              resolve({ diff: stdout });
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Error in GitService: ${ error.message }`);
    }
  }
}

module.exports = new GitService();
