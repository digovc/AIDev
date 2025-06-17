const fs = require('fs').promises;
const path = require('path');
const projectsStore = require("../stores/projects.store");
const { readFileSync } = require("node:fs");

class FileEditTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./file-edit.txt"), "utf8");

  getDefinition() {
    return {
      name: "fileEdit",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["filePath", "oldString"],
        properties: {
          filePath: {
            description: "The path to the file to modify",
            type: "string"
          },
          oldString: {
            description: "The text to replace",
            type: "string"
          },
          newString: {
            description: "The text to replace it with",
            type: "string"
          },
          replaceAll: {
            description: "Replace all occurences of oldString (default false)",
            type: "boolean"
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    if (!input.filePath) throw new Error("The parameter file_path is required");
    if (!input.oldString) throw new Error("The parameter old_string is required");

    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.filePath);

    let content = '';

    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw `Error editing file ${ input.file }: ${ error.message }`;
      }
    }

    if (!content.includes(input.oldString)) {
      throw new Error(`File ${ input.file } does not contain oldString`);
    }

    if (input.replaceAll) {
      content = content.replaceAll(input.oldString, input.newString);
    } else {
      content = content.replace(input.oldString, input.newString);
    }

    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');

    return {
      success: true,
      message: `File ${ input.file } edited successfully.`
    };
  }
}

module.exports = new FileEditTool();
