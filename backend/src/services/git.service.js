const { exec } = require('child_process');
const { promisify } = require('util');
const projectsStore = require('../stores/projects.store');
const tasksStore = require('../stores/tasks.store');

const execAsync = promisify(exec);

class GitService {
  async getFilesChanged(taskId) {
    try {
      const task = await tasksStore.getById(taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      const projectId = task.projectId;

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

      // Execute git status --porcelain command
      const { stdout, stderr } = await execAsync('git status --porcelain', { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to get git status: ${ stderr }`);
      }

      // Parse the output
      return stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const status = line.substring(0, 2).trim();
          const name = line.substring(3);
          return { name, status };
        });
    } catch (error) {
      throw new Error(`Error in GitService: ${ error.message }`);
    }
  }
}

module.exports = new GitService();
