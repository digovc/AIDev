const OpenAI = require('openai');
const settingsStore = require('../stores/settings.store');
const OpenAiProvider = require('./open-ai.provider');

class OpenAICompatibleProvider extends OpenAiProvider {
  constructor(apiKeyPath, baseURL) {
    super();
    this.apiKeyPath = apiKeyPath;
    this.baseURL = baseURL;
  }

  async getApiKey() {
    const settings = await settingsStore.getSettings();
    if (!settings[this.apiKeyPath]?.apiKey) {
      throw new Error(`${this.apiKeyPath} API key is required`);
    }
    return settings[this.apiKeyPath].apiKey;
  }

  createOpenAIClient(apiKey) {
    return new OpenAI({
      apiKey,
      baseURL: this.baseURL
    });
  }
}

module.exports = OpenAICompatibleProvider;
