const fs = require('fs').promises;
const path = require('path');
const projectsStore = require('../stores/projects.store');

class WriteFileTool {
  getDefinition() {
    return {
      name: "write_file",
      description: "Creates or updates a file in the project",
      input_schema: {
        type: "object",
        required: ["file", "blocks"],
        properties: {
          file: {
            type: "string",
            description: "Path of the file to be created or updated"
          },
          blocks: {
            type: "array",
            description: "List of write operation blocks",
            items: {
              type: "object",
              required: ["new_snippet"],
              properties: {
                original_snippet: {
                  type: "string",
                  description: "The exact text snippet to find and replace." +
                    "Keep this value concise and short." +
                    "Break large changes into multiple blocks." +
                    "Include just the changing lines, and a few surrounding lines if necessary for uniqueness." +
                    "Do not include long runs of unchanged lines."
                },
                new_snippet: {
                  type: "string",
                  description: "The new text to replace the original snippet with"
                }
              }
            }
          }
        }
      }
    };
  }

  async executeTool(conversation, input) {
    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.file);

    let content = '';

    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw `Error writing file ${ input.file }: ${ error.message }`;
      }
    }

    for (const block of input.blocks) {
      if (block.original_snippet) {
        if (!content.includes(block.original_snippet)) {
          throw new Error(`Block of text not found in file ${ input.file }: ${ block.original_snippet }`);
        }

        content = content.replace(block.original_snippet, block.new_snippet);
      } else {
        content = block.new_snippet;
      }
    }

    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');

    return {
      success: true,
      message: `File ${ input.file } updated successfully.`
    };
  }
}

module.exports = new WriteFileTool();
