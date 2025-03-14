const nunjucks = require('nunjucks');
const fs = require('fs').promises;

class PromptParserService {
  async parsePrompt(promptFile, data) {
    const fileContent = await fs.readFile(promptFile, 'utf8');
    return nunjucks.renderString(fileContent, data);
  }
}

module.exports = new PromptParserService();
