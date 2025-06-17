const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore');
const projectsStore = require('../stores/projects.store');
const DESCRIPTION = require('./ls.txt');

class LsTool {
  getDefinition() {
    return {
      name: "ls",
      description: DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["path"],
        properties: {
          path: {
            description: "The directory you want to list",
            type: "string"
          },
          ignore: {
            description: "An array of glob patterns to ignore",
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      }
    };
  }

  async executeTool(conversation, input) {
    const project = await projectsStore.getById(conversation.projectId);
    const basePath = path.join(project.path, input.path);

    // Verifica se o caminho existe
    let stats;
    try {
      stats = await fs.stat(basePath);
    } catch (error) {
      throw new Error(`Path not found: ${ basePath }`);
    }

    // Carrega regras de ignore
    const ig = await this._loadGitignoreRules(project.path);
    if (input.ignore) {
      ig.add(input.ignore);
    }

    // Processa arquivos/diretórios
    let entries = [];
    if (stats.isFile()) {
      // Se for arquivo, retorna apenas ele
      entries.push({
        name: path.basename(basePath),
        path: basePath,
        isDirectory: false,
        size: stats.size,
        mtime: stats.mtime
      });
    } else {
      // Lista conteúdo do diretório
      const dirEntries = await fs.readdir(basePath, { withFileTypes: true });

      for (const entry of dirEntries) {
        const entryPath = path.join(basePath, entry.name);
        const relativePath = path.relative(project.path, entryPath);

        // Verifica regras de ignore
        if (ig.ignores(relativePath)) continue;

        const entryStats = await fs.stat(entryPath);
        entries.push({
          name: entry.name,
          path: entryPath,
          isDirectory: entryStats.isDirectory(),
          size: entryStats.isDirectory() ? 0 : entryStats.size,
          mtime: entryStats.mtime
        });
      }
    }

    // Ordena por data de modificação (mais recente primeiro)
    entries.sort((a, b) => b.mtime - a.mtime);

    // Limita resultados
    const totalEntries = entries.length;
    const truncated = totalEntries > 100;
    const limitedEntries = entries.slice(0, 100);

    return {
      success: true,
      entries: limitedEntries.map(entry => ({
        name: entry.name,
        path: entry.path,
        is_directory: entry.isDirectory,
        size: entry.size,
        mtime: entry.mtime.toISOString()
      })),
      count: limitedEntries.length,
      total: totalEntries,
      truncated
    };
  }

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
        // Arquivo não encontrado, ignora erro
      }

      currentPath = path.dirname(currentPath);
    }

    return ig;
  }
}

module.exports = new LsTool();
