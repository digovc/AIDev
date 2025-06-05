const fs = require('fs').promises;
const path = require('path');
const projectsStore = require('../stores/projects.store');
const tasksStore = require('../stores/tasks.store');

class FilesService {
  async getFileContent(taskId, filePath) {
    const task = await tasksStore.getById(taskId);
    const project = await projectsStore.getById(task.projectId);
    const projectPath = path.dirname(project.path);
    const absolutePath = path.join(projectPath, filePath);

    try {
      const content = await fs.readFile(absolutePath, 'utf8');
      return { content };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }
}

module.exports = new FilesService();
