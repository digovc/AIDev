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
          const path = line.substring(3);
          return { path, status };
        });
    } catch (error) {
      throw new Error(`Error in GitService: ${ error.message }`);
    }
  }

  async getContentVersions(taskId, filePath) {
    try {
      const task = await tasksStore.getById(taskId);
      if (!task) throw new Error('Task not found');

      const project = await projectsStore.getById(task.projectId);
      if (!project) throw new Error('Project not found');
      if (!project.path) throw new Error('Project path not defined');

      const projectPath = project.path;

      // Get current file content
      const currentContent = await execAsync(`git show HEAD:${filePath}`, { cwd: projectPath })
        .then(({ stdout }) => stdout)
        .catch(() => ''); // Handle file not found or other errors

      // Get previous file content (HEAD~1)
      const previousContent = await execAsync(`git show HEAD~1:${filePath}`, { cwd: projectPath })
        .then(({ stdout }) => stdout)
        .catch(() => ''); // Handle file not found or other errors

      return { previous: previousContent, current: currentContent };
    } catch (error) {
      throw new Error(`Error in GitService: ${error.message}`);
    }
  }
}

module.exports = new GitService();
