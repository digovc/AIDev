const OpenAICompatibleProvider = require('./open-ai-compatible.provider');

class AlibabaProvider extends OpenAICompatibleProvider {
  constructor() {
    super('alibaba', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1');
  }
}

module.exports = new AlibabaProvider();
