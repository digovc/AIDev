const path = require('path');
const fg = require('fast-glob');
const ignore = require('ignore');
const DESCRIPTION = require('./glob.txt');
const projectsStore = require("../stores/projects.store");

class GlobTool {
  getDefinition() {
    return {
      name: "glob",
      description: DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["pattern"],
        properties: {
          pattern: {
            description: "The glob pattern to match files against",
            type: "string"
          },
          path: {
            description: "The directory to search in. If not specified, the current working directory will be used",
            type: "string"
          }
        }
      }
    }
  }

  async executeTool(conversation, input) {
    if (!input.pattern) throw new Error("The parameter pattern is required");

    const project = await projectsStore.getById(conversation.projectId);
    const basePath = input.path ? path.join(project.path, input.path) : project.path;

    // Buscar todos os arquivos correspondentes ao padrão
    const files = await fg(input.pattern, {
      cwd: basePath,
      absolute: true,
      onlyFiles: true,
      stats: true,
      dot: true,
    });

    // Carregar regras de .gitignore
    const ig = await this._loadGitignoreRules(basePath);

    // Filtrar arquivos ignorados e processar estatísticas
    const processedFiles = [];
    for (const file of files) {
      const relativePath = path.relative(basePath, file.path);

      // Ignorar arquivos listados no .gitignore
      if (ig.ignores(relativePath)) continue;

      processedFiles.push({
        path: file.path,
        mtime: file.stats.mtime
      });
    }

    // Ordenar por modificação recente (decrescente)
    processedFiles.sort((a, b) => b.mtime - a.mtime);

    const totalFiles = processedFiles.length;
    const truncated = totalFiles > 100;

    // Limitar a 100 arquivos
    const limitedFiles = processedFiles.slice(0, 100);

    return {
      success: true,
      files: limitedFiles.map(file => ({
        path: file.path,
        mtime: file.mtime.toISOString(),
      })),
      count: limitedFiles.length,
      truncated,
      total: totalFiles,
    };
  }

  // Carrega regras de .gitignore recursivamente
  async _loadGitignoreRules(basePath) {
    const ig = ignore();
    let currentPath = basePath;
    const rootPath = path.parse(basePath).root;

    while (currentPath !== rootPath) {
      const gitignorePath = path.join(currentPath, '.gitignore');

      try {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        ig.add(gitignoreContent);
      } catch (error) {
        // Arquivo .gitignore não existe, ignorar erro
      }

      // Subir um nível no diretório
      currentPath = path.dirname(currentPath);
    }

    return ig;
  }
}

module.exports = new GlobTool();
