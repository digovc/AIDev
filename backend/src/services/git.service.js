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
      const task = await tasksStore.getById(taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      const projectId = task.projectId;
      const project = await projectsStore.getById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      const projectPath = project.path;

      if (!projectPath) {
        throw new Error('Project path not defined');
      }

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

  async pushChanges(taskId) {
    try {
      const task = await tasksStore.getById(taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      const projectId = task.projectId;
      const project = await projectsStore.getById(projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      const projectPath = project.path;

      if (!projectPath) {
        throw new Error('Project path not defined');
      }

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
}

module.exports = new GitService();
