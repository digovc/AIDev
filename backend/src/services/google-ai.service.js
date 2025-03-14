const settingsStore = require('../stores/settings.store');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GoogleAIService {
  async chatCompletion(model, messages, cancelationToken, tools, streamCallback) {
    if (cancelationToken.isCanceled()) {
      return;
    }

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings.google.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const googleAI = new GoogleGenerativeAI(apiKey);
    const googleModel = googleAI.getGenerativeModel({ model: model });

    const stream = await googleModel.generateContentStream({
      contents: formattedMessages,
      tools: tools,
    });

    const currentBlock = {}

    for await (const chunk of stream) {
      if (cancelationToken.isCanceled()) {
        return stream.stream.throw(new Error('Canceled'));
      }

      this.translateStreamEvent(chunk, currentBlock, streamCallback);
    }
  }

  translateStreamEvent(chunk, currentBlock, streamCallback) {
  }

  getMessages(messages) {
  }

  getRole(sender) {
    switch (sender) {
      case 'tool':
        return 'toll';
      case 'user_system':
        return 'user';
      default:
        return sender;
    }
  }
}

module.exports = new GoogleAIService();
