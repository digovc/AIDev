const ignore = require('ignore');
const path = require('path');
const fs = require('fs');

class RepositoryFileSearchService {
  static MAX_RESULTS = 15;

  searchFiles(folder, filter) {
    const absolutePath = path.resolve(folder);
    const results = [];
    const ig = this._loadGitignore(absolutePath);
    const normalizedFilter = filter.toLowerCase().trim();
    const filterChars = normalizedFilter.split('');

    this._recursiveSearch(absolutePath, filterChars, results, ig, absolutePath);

    return results;
  }

  _normalizePathForIgnore(filePath) {
    return filePath.replace(/\\/g, '/');
  }

  _loadGitignore(folderPath) {
    const ig = ignore();
    const defaultIgnores = ['.git', 'node_modules'];
    ig.add(defaultIgnores);

    const gitignorePath = path.join(folderPath, '.gitignore');

    if (fs.existsSync(gitignorePath)) {
      try {
        const gitignoreContent = fs.readFileSync(gitignorePath).toString();
        ig.add(gitignoreContent);
      } catch (error) {
        console.error(`Erro ao ler o arquivo .gitignore em ${ gitignorePath }:`, error);
      }
    }
    return ig;
  }

  _recursiveSearch(currentDirPath, filterChars, results, ig, initialBaseFolder) {
    if (results.length >= RepositoryFileSearchService.MAX_RESULTS) {
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(currentDirPath, { withFileTypes: true });
    } catch (error) {
      return;
    }

    for (const entry of entries) {
      if (results.length >= RepositoryFileSearchService.MAX_RESULTS) {
        break;
      }

      const entryPath = path.join(currentDirPath, entry.name);
      const relativePathFromBase = path.relative(initialBaseFolder, entryPath);
      const relativePathNormalized = this._normalizePathForIgnore(relativePathFromBase);

      if (relativePathNormalized && ig.ignores(relativePathNormalized)) {
        continue;
      }

      if (entry.isFile()) {
        if (this._isFileMatchingFilter(entry.name, filterChars)) {
          results.push(entryPath);
        }
      } else if (entry.isDirectory()) {
        this._recursiveSearch(entryPath, filterChars, results, ig, initialBaseFolder);
      }
    }
  }

  _isFileMatchingFilter(filePath, filterChars) {
    const filePathChars = filePath.toLowerCase().split('');
    const filterIndexes = [];

    for (let i = 0, x = 0; i < filePathChars.length; i++) {
      if (filterChars.length <= i) break;
      x = filePathChars.indexOf(filterChars[i], x);
      if (x === -1) return false;
      filterIndexes.push(x);
    }

    if (filterIndexes.length !== filterChars.length) return false;
    return filterIndexes.every(i => i > -1);
  }
}

module.exports = new RepositoryFileSearchService();
