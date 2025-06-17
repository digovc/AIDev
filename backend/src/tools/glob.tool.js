const path = require('path');
const fg = require('fast-glob');
const ignore = require('ignore');
const projectsStore = require("../stores/projects.store");
const { readFileSync } = require("node:fs");
const fs = require("node:fs");

const FIXED_IGNORE_PATTERNS = [
  '**/node_modules/',
  '**/__pycache__/',
  '**/.git/',
  '**/dist/',
  '**/build/',
  '**/target/',
  '**/vendor/',
  '**/bin/',
  '**/obj/',
  '**/.idea/',
  '**/.vscode/',
];

class GlobTool {
  DESCRIPTION = readFileSync(path.join(__dirname, "./glob.txt"), "utf8");

  getDefinition() {
    return {
      name: "glob",
      description: this.DESCRIPTION,
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
          },
          ignore: {
            description: "List of glob patterns to ignore",
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      }
    }
  }

  async executeTool(conversation, input) {
    if (!input.pattern) throw new Error("The parameter pattern is required");

    const project = await projectsStore.getById(conversation.projectId);
    const basePath = input.path ? path.join(project.path, input.path) : project.path;
    const rootGitIgnorePath = path.join(project.path, '.gitignore');
    const ignoreContent = fs.readFileSync(rootGitIgnorePath, 'utf8');

    const ignorePatterns = ignoreContent.split('\n')
      .filter(x => !x.startsWith('#'))
      .filter(x => x.trim() !== '')
      .concat(input.ignore ?? [])
      .concat(FIXED_IGNORE_PATTERNS);

    // Buscar todos os arquivos correspondentes ao padrão
    const files = await fg(input.pattern, {
      cwd: basePath,
      absolute: false,
      onlyFiles: true,
      stats: false,
      dot: false,
      ignore: ignorePatterns,
      deep: 5
    });

    const ig = ignore();

    for (const pattern of ignorePatterns) {
      ig.add(pattern);
    }

    const processedFiles = [];
    for (const file of files) {
      const relativePath = path.relative(basePath, file);
      if (ig.ignores(relativePath)) continue;
      processedFiles.push(file);
    }

    const totalFiles = processedFiles.length;
    const truncated = totalFiles > 100;

    const limitedFiles = processedFiles.slice(0, 100);

    return {
      success: true,
      files: limitedFiles,
      count: limitedFiles.length,
      truncated,
      total: totalFiles,
    };
  }
}

module.exports = new GlobTool();
