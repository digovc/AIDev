const fs = require('fs').promises;
const path = require('path');
const projectsStore = require("../stores/projects.store");
const { readFileSync } = require("node:fs");

class FileMultiEditTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./file-multi-edit.txt"), "utf8");

  getDefinition() {
    return {
      name: "fileMultiEdit",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["filePath", "edits"],
        properties: {
          filePath: {
            description: "The path to the file to modify",
            type: "string"
          },
          edits: {
            type: "array",
            description: "List of edit operations to perform",
            items: {
              type: "object",
              required: ["oldString", "newString"],
              properties: {
                old_string: {
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
        }
      }
    };
  }

  async executeTool(conversation, input) {
    if (!input.filePath) throw new Error("The parameter filePath is required");
    if (!input.edits || !Array.isArray(input.edits)) {
      throw new Error("The parameter edits must be a non-empty array");
    }

    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.filePath);

    // Read original file content
    let originalContent = '';
    try {
      originalContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Error reading file ${ input.filePath }: ${ error.message }`);
      }
    }

    // Validate and simulate edits without modifying original
    let modifiedContent = originalContent;
    for (let i = 0; i < input.edits.length; i++) {
      const edit = input.edits[i];
      const { oldString, newString } = edit;
      const replaceAll = !!edit.replaceAll;

      if (oldString === newString) {
        throw new Error(`Edit #${ i + 1 }: oldString and newString are identical`);
      }

      if (!modifiedContent.includes(oldString)) {
        throw new Error(`Edit #${ i + 1 }: oldString not found in file content`);
      }

      if (replaceAll) {
        modifiedContent = modifiedContent.replaceAll(oldString, newString);
      } else {
        modifiedContent = modifiedContent.replace(oldString, newString);
      }
    }

    // Create directory if needed and write changes
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, modifiedContent, 'utf8');

    return {
      success: true,
      message: `File ${ input.filePath } edited successfully.`
    };
  }
}

module.exports = new FileMultiEditTool();
