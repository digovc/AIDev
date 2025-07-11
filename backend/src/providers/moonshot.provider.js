const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class MoonshotProvider extends OpenAICompatibleProvider {
  constructor() {
    super('moonshot', 'https://api.moonshot.ai/v1');
  }
}

module.exports = new MoonshotProvider();