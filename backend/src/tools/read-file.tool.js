const fs = require('fs').promises;
const path = require('path');
const projectsStore = require('../stores/projects.store');

class ReadFileTool {
  getDefinition() {
    return {
      name: "read_file",
      description: "Reads the content of a file in the project",
      input_schema: {
        type: "object",
        required: ["file"],
        properties: {
          file: {
            type: "string",
            description: "Directory of the file to be read"
          }
        }
      }
    }
  }

  async executeTool(conversation, input) {
    const project = await projectsStore.getById(conversation.projectId);
    const projectPath = project.path;
    const filePath = path.resolve(projectPath, input.file);

    try {
      // Ler o conteúdo do arquivo
      const content = await fs.readFile(filePath, 'utf8');

      return {
        success: true,
        content: content,
        message: `Arquivo ${ input.file } lido com sucesso.`
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Arquivo ${ input.file } não encontrado.`);
      }

      throw `Erro ao ler o arquivo ${ input.file }: ${ error.message }`;
    }
  }
}

module.exports = new ReadFileTool();
