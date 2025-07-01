const fs = require('fs').promises;
const path = require('path');
const projectsStore = require("../stores/projects.store");
const { readFileSync } = require("node:fs");

class FileMultiEditTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./file-multi-edit.txt"), "utf8");

  getDefinition() {
    return {
      name: "file_multi_edit",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["file_path", "edits"],
        properties: {
          file_path: {
            description: "The path to the file to modify",
            type: "string"
          },
          edits: {
            type: "array",
            description: "List of edit operations to perform",
            items: {
              type: "object",
              required: ["old_string", "new_string"],
              properties: {
                old_string: {
                  description: "The text to replace",
                  type: "string"
                },
                new_string: {
                  description: "The text to replace it with",
                  type: "string"
                },
                replace_all: {
                  description: "Replace all occurences of oldString (default false)",
                  type: "boolean"
                }
              }
            }
          }
        }
      }
    };
  }

  async executeTool(conversation, input) {
    if (!input.file_path) throw new Error("The parameter file_path is required");
    if (!input.edits || !Array.isArray(input.edits)) {
      throw new Error("The parameter edits must be a non-empty array");
    }

    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.file_path);

    // Read original file content
    let originalContent = '';
    try {
      originalContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Error reading file ${ input.file_path }: ${ error.message }`);
      }
    }

    // Validate and simulate edits without modifying original
    let modifiedContent = originalContent;
    for (let i = 0; i < input.edits.length; i++) {
      const edit = input.edits[i];
      const { old_string, new_string } = edit;
      const replace_all = !!edit.replace_all;

      if (old_string === new_string) {
        throw new Error(`Edit #${ i + 1 }: old_string and new_string are identical`);
      }

      if (!modifiedContent.includes(old_string)) {
        throw new Error(`Edit #${ i + 1 }: old_string not found in file content`);
      }

      if (replace_all) {
        modifiedContent = modifiedContent.replaceAll(old_string, new_string || '');
      } else {
        modifiedContent = modifiedContent.replace(old_string, new_string || '');
      }
    }

    // Create directory if needed and write changes
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, modifiedContent, 'utf8');

    return {
      success: true,
      message: `File ${ input.file_path } edited successfully.`
    };
  }
}

module.exports = new FileMultiEditTool();
