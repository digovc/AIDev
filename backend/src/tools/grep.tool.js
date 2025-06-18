const path = require('path');
const { readFileSync } = require('node:fs');
const { execFile } = require('child_process');
const projectsStore = require('../stores/projects.store');

class GrepTool {
  DESCRIPTION = readFileSync(path.join(__dirname, './grep.txt'), 'utf8');

  getDefinition() {
    return {
      name: 'grep',
      description: this.DESCRIPTION,
      input_schema: {
        type: 'object',
        required: ['pattern'],
        properties: {
          pattern: {
            description: 'The regex pattern to search for',
            type: 'string'
          },
          path: {
            description: 'Directory to search in relative to project root',
            type: 'string'
          },
          ignore: {
            description: 'List of glob patterns to ignore',
            type: 'array',
            items: { type: 'string' }
          },
          caseSensitive: {
            description: 'Boolean flag for case-sensitive search',
            type: 'boolean'
          },
          maxResults: {
            description: 'Maximum number of matches to return',
            type: 'integer'
          }
        }
      }
    };
  }

  async executeTool(conversation, input) {
    if (!input.pattern) throw new Error('The parameter pattern is required');

    const project = await projectsStore.getById(conversation.projectId);
    const basePath = input.path ? path.join(project.path, input.path) : project.path;

    const caseSensitive = input.caseSensitive === true;
    const maxResults = typeof input.maxResults === 'number' ? input.maxResults : 100;
    const ignoreGlobs = Array.isArray(input.ignore) ? input.ignore : [];

    // Build ripgrep arguments
    const args = ['--vimgrep'];
    if (!caseSensitive) {
      args.push('-i');
    }
    // Respect .gitignore by default
    // Add ignore patterns
    ignoreGlobs.forEach((pattern) => {
      // Exclude pattern
      args.push('--glob', `!${pattern}`);
    });
            // Pattern and search path
    args.push(input.pattern, '.');

    // Execute ripgrep
    const stdout = await new Promise((resolve, reject) => {
      execFile('rg', args, { cwd: basePath, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          // Exit code 1 means no matches
          if (error.code === 1) {
            return resolve('');
          }
          return reject(new Error(`ripgrep error: ${stderr || error.message}`));
        }
        resolve(stdout);
      });
    });

    // Parse matches
    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    const matches = [];
    for (const line of lines) {
      // format: file:line:col:match
      const match = line.match(/^(.+?):(\d+):(\d+):(.*)$/);
      if (match) {
        const [, file, lineno, colno, text] = match;
        matches.push({ file, line: parseInt(lineno, 10), column: parseInt(colno, 10), text });
      }
    }

    const total = matches.length;
    const truncated = total > maxResults;
    const limited = truncated ? matches.slice(0, maxResults) : matches;

    return {
      success: true,
      matches: limited,
      count: limited.length,
      total,
      truncated
    };
  }
}

module.exports = new GrepTool();
