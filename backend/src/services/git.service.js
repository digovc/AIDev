const { exec } = require('child_process');
const { promisify } = require('util');
const projectsStore = require('../stores/projects.store');
const tasksStore = require('../stores/tasks.store');
const path = require("node:path");
const fs = require("node:fs").promises;

const execAsync = promisify(exec);

class GitService {
  async getFilesChanged(taskId) {
    try {
      const projectPath = await this._getProjectPath(taskId);

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
      const projectPath = await this._getProjectPath(taskId);

      // Get current file content
      const previousContent = await execAsync(`git show HEAD:${ filePath }`, { cwd: projectPath })
        .then(({ stdout }) => stdout)
        .catch(() => ''); // Handle file not found or other errors

      const filePathWithProject = path.join(projectPath, filePath);
      const currentContent = await fs.readFile(filePathWithProject, 'utf8');

      return { previous: previousContent, current: currentContent };
    } catch (error) {
      throw new Error(`Error in GitService: ${ error.message }`);
    }
  }

  async getRemoteBranches(taskId) {
    try {
      const projectPath = await this._getProjectPath(taskId);

      // Fetch remote branches
      const { stdout, stderr } = await execAsync('git branch -r', { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to get remote branches: ${ stderr }`);
      }

      // Parse the output to get branch names
      return stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.trim().replace('origin/', ''));
    } catch (error) {
      throw new Error(`Error in GitService.getRemoteBranches: ${ error.message }`);
    }
  }

  async checkout(taskId, branch) {
    try {
      const projectPath = await this._getProjectPath(taskId);

      // if some changes exist, throw an error
      const { stdout, stderr } = await execAsync('git status --porcelain', { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to get git status: ${ stderr }`);
      }

      if (stdout) {
        throw new Error('Some changes exist in the project. Please commit or stash them before checking out a branch.');
      }

      // Fetch remote branches
      await execAsync('git fetch origin', { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to get remote branches: ${ stderr }`);
      }

      // Switch to a branch formatted as 'aidev-<task-id>'
      await execAsync(`git checkout -b ${ branch }`, { cwd: projectPath });

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.checkout: ${ error.message }`);
    }
  }

  async pushChanges(taskId) {
    try {
      const { task, projectPath } = await this._getProjectPath(taskId);

      // Switch to a branch formatted as 'aidev-<task-id>'
      const branchName = `aidev-${ taskId }`;
      await execAsync(`git checkout -b ${ branchName }`, { cwd: projectPath });

      // Add all changes (modified, added, or deleted files)
      await execAsync('git add -A', { cwd: projectPath });

      // Create a commit with the task title as the message
      const commitMessage = `${ task.title } - ${ new Date().toISOString() }`;
      await execAsync(`git commit -m "${ commitMessage }"`, { cwd: projectPath });

      // Push the changes to the remote repository
      await execAsync(`git push origin ${ branchName }`, { cwd: projectPath });

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.pushChanges: ${ error.message }`);
    }
  }

  async _getProjectPath(taskId) {
    const task = await tasksStore.getById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const project = await projectsStore.getById(task.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const projectPath = project.path;
    if (!projectPath) {
      throw new Error('Project path not defined');
    }
    return { task, projectPath };
  }
}

module.exports = new GitService();
