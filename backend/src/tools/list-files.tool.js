const fs = require('fs').promises;
const path = require('path');
const projecsStore = require('../stores/projects.store');

class ListFilesTool {
  getDefinition() {
    return {
      name: "list_files",
      description: "Lists the directories and files of the project",
      input_schema: {
        type: "object",
        required: ["folder"],
        properties: {
          folder: {
            description: "The directory you want to list",
            type: "string"
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    const project = await projecsStore.getById(conversation.projectId);
    const projectFolder = project.path;

    if (!input.folder) {
      input.folder = '.';
    }

    const folder = path.join(projectFolder, input.folder);
    const files = await fs.readdir(folder);

    const promises = files.map(async file => {
      const stats = await fs.stat(path.join(folder, file));

      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size
      };
    });

    return await Promise.all(promises);
  }
}

module.exports = new ListFilesTool();
