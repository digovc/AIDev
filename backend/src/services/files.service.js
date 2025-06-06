const fs = require('fs').promises;
const path = require('path');
const projectsStore = require('../stores/projects.store');

class FilesService {
  async getFileContent(projectId, filePath) {
    const project = await projectsStore.getById(projectId);
    const absolutePath = path.join(project.path, filePath);

    try {
      const content = await fs.readFile(absolutePath, 'utf8');
      return { content };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${ filePath }`);
      }
      throw error;
    }
  }
}

module.exports = new FilesService();
