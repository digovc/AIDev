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
              required: ["new_text"],
              properties: {
                original_text: {
                  type: "string",
                  description: "Exact text to be replaced in the file"
                },
                new_text: {
                  type: "string",
                  description: "Text to be inserted in the file"
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

    // Verificar se o arquivo existe
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      // Se o arquivo não existir, começamos com conteúdo vazio
      if (error.code !== 'ENOENT') {
        throw new Error(`Erro ao escrever arquivo ${ input.file }: ${ error.message }`);
      }
    }

    // Processar cada bloco
    for (const block of input.blocks) {
      if (block.search) {
        // Substituir conteúdo existente
        if (!content.includes(block.search)) {
          throw new Error(`Bloco de texto não encontrado no arquivo ${ input.file }: ${ block.search }`);
        }

        content = content.replace(block.search, block.replace);
      } else {
        // Adicionar novo conteúdo
        content = block.replace;
      }
    }

    // Garantir que o diretório exista
    const directory = path.dirname(filePath);
    await fs.mkdir(directory, { recursive: true });

    // Escrever o arquivo
    await fs.writeFile(filePath, content, 'utf8');

    return {
      success: true,
      message: `Arquivo ${ input.file } atualizado com sucesso.`
    };
  }
}

module.exports = new WriteFileTool();
