const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super('groq', 'https://api.groq.com/openai/v1');
  }
}

module.exports = new GroqProvider();