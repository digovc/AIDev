const fs = require('fs').promises;
const path = require('path');
const DESCRIPTION = require('./file-write.txt');
const projectsStore = require("../stores/projects.store");

class FileWriteTool {
  getDefinition() {
    return {
      name: "fileWrite",
      description: DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["filePath", "content"],
        properties: {
          filePath: {
            description: "The path to the file to modify",
            type: "string"
          },
          content: {
            description: "The text to write to the file",
            type: "string"
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    if (!input.filePath) throw new Error("The parameter file_path is required");
    if (!input.content) throw new Error("The parameter content is required");

    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.filePath);
    const filePathOnly = path.basename(filePath);

    await fs.mkdir(filePathOnly, { recursive: true });
    await fs.writeFile(filePath, input.content, 'utf8');

    return {
      success: true,
      message: `File ${ input.file } created successfully.`
    };
  }
}

module.exports = new FileWriteTool();
