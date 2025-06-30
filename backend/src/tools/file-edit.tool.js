const fs = require('fs').promises;
const path = require('path');
const projectsStore = require("../stores/projects.store");
const { readFileSync } = require("node:fs");

class FileEditTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./file-edit.txt"), "utf8");

  getDefinition() {
    return {
      name: "file_edit",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["file_path", "old_string"],
        properties: {
          file_path: {
            description: "The path to the file to modify",
            type: "string"
          },
          old_string: {
            description: "The text to replace",
            type: "string"
          },
          new_string: {
            description: "The text to replace it with",
            type: "string"
          },
          replace_all: {
            description: "Replace all occurences of old_string (default false)",
            type: "boolean"
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    if (!input.file_path) throw new Error("The parameter file_path is required");
    if (!input.old_string) throw new Error("The parameter old_string is required");

    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.file_path);

    let content = '';

    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw `Error editing file ${ input.file }: ${ error.message }`;
      }
    }

    if (!content.includes(input.old_string)) {
      throw new Error(`File ${ input.file } does not contain oldString`);
    }

    if (input.replace_all) {
      content = content.replaceAll(input.old_string, input.new_string);
    } else {
      content = content.replace(input.old_string, input.new_string);
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
