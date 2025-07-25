const fs = require('fs').promises;
const path = require('path');
const projectsStore = require('../stores/projects.store');
const { readFileSync } = require("node:fs");

class FileReadTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./file-read.txt"), "utf8");
  getDefinition() {
    return {
      name: "file_read",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["file_path"],
        properties: {
          file_path: {
            type: "string",
            description: "Directory of the file to be read"
          },
          offset: {
            type: "number",
            description: "The number of lines to skip from the beginning of the file (default 0)"
          },
        }
      }
    }
  }

  async executeTool(conversation, input) {
    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.file_path);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const offset = input.offset || 0;
      const limit = 1000;

      const contentPage = lines.slice(offset, offset + limit).join('\n');

      return {
        success: true,
        message: `File ${ input.file_path } read successfully.`,
        truncated: contentPage.length !== content.length,
        content: contentPage,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File ${ input.file_path } not found.`);
      }

      throw new Error(`Error reading file ${ input.file_path }: ${ error.message }`);
    }
  }
}

module.exports = new FileReadTool();
