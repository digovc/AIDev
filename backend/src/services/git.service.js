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
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

      // Add all new files to the staging area
      await execAsync('git add -A', { cwd: projectPath });

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
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

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
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

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
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

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

      // Switch to a branch formatted as 'task-<task-id>'
      await execAsync(`git checkout -b ${ branch }`, { cwd: projectPath });

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.checkout: ${ error.message }`);
    }
  }

  async pushChanges(taskId) {
    try {
      const { task, projectPath } = await this._getTaskAndProjectPath(taskId);

      const branchName = `task-${ taskId }`;
      await execAsync(`git checkout ${ branchName } || git checkout -b ${ branchName }`, { cwd: projectPath });

      await execAsync('git add -A', { cwd: projectPath });

      const commitMessage = `[${ task.id }] ${ task.description }`;
      await execAsync(`git commit -m "${ commitMessage }"`, { cwd: projectPath });

      await execAsync(`git push origin ${ branchName }`, { cwd: projectPath });

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.pushChanges: ${ error.message }`);
    }
  }

  async rollback(taskId, filePath) {
    try {
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

      // Execute git checkout command to revert the file
      const { stderr } = await execAsync(`git checkout HEAD -- "${ filePath }"`, { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to rollback file: ${ stderr }`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.rollback: ${ error.message }`);
    }
  }

  async deleteFile(taskId, filePath) {
    try {
      const { projectPath } = await this._getTaskAndProjectPath(taskId);

      // Delete the file from the repository
      const { stderr } = await execAsync(`rm -f "${ filePath }"`, { cwd: projectPath });

      if (stderr) {
        throw new Error(`Failed to delete file: ${ stderr }`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error in GitService.deleteFile: ${ error.message }`);
    }
  }

  async _getTaskAndProjectPath(taskId) {
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
