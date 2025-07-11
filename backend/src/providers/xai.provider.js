const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class XAIProvider extends OpenAICompatibleProvider {
  constructor() {
    super('xai', 'https://api.x.ai/v1');
  }
}

module.exports = new XAIProvider();