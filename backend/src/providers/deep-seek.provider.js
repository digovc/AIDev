const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor() {
    super('deepseek', 'https://api.deepseek.com');
  }
}

module.exports = new DeepSeekProvider();
