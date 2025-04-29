const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor() {
    super('openrouter', 'https://openrouter.ai/api/v1');
  }
}

module.exports = new OpenRouterProvider();
