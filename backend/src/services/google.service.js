const { GoogleGenerativeAI } = require('@google/generative-ai');
const settingsStore = require('../stores/settings.store');

class GoogleService {
  async chatCompletion(assistent, messages, cancelationToken, tools, streamCallback) {
    if (cancelationToken.isCanceled()) {
      return;
    }

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings.gemini.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: assistent.model || 'gemini-1.5-flash' });

    const promptContent = this.buildPromptContent(formattedMessages);

    try {
      streamCallback({ type: 'message_start', inputTokens: 0 }); // Google API não fornece contagem de tokens
      streamCallback({ type: 'block_start', blockType: 'text' });

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: promptContent }] }],
        tools: this.formatTools(tools),
      });

      for await (const chunk of result.stream) {
        if (cancelationToken.isCanceled()) {
          return result.stream.cancel();
        }

        const chunkText = chunk.text();
        streamCallback({ type: 'block_delta', delta: chunkText });
      }

      streamCallback({ type: 'block_stop' });
      streamCallback({ type: 'message_stop' });
    } catch (error) {
      streamCallback({ type: 'block_stop' });
      streamCallback({ type: 'message_stop' });
      throw error;
    }
  }

  formatTools(tools) {
    if (!tools || !tools.length) return [];

    return tools.map(tool => ({
      functionDeclarations: [{
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }]
    }));
  }

  buildPromptContent(messages) {
    let promptContent = '';

    for (const message of messages) {
      const role = message.role;
      const content = typeof message.content === 'string' ? message.content : this.formatComplexContent(message.content);

      promptContent += `${ role.toUpperCase() }: ${ content }\n\n`;
    }

    return promptContent;
  }

  formatComplexContent(content) {
    if (Array.isArray(content)) {
      return content.map(item => {
        if (item.type === 'text') {
          return item.text;
        } else if (item.type === 'tool_use') {
          return `Using tool: ${ item.name } with parameters: ${ JSON.stringify(item.input) }`;
        } else if (item.type === 'tool_result') {
          return `Tool result: ${ item.content }`;
        }
        return '';
      }).join('\n');
    }
    return content.toString();
  }

  getMessages(messages) {
    const formattedMessages = []

    for (const message of messages) {
      if (!message.blocks?.length) {
        continue
      }

      switch (message.sender) {
        case 'system':
          formattedMessages.push({
            role: 'system',
            content: this.getTextContent(message.blocks)
          });
          break;
        case 'log':
          break;
        default:
          formattedMessages.push({
            role: this.getRole(message.sender),
            content: this.getContent(message.blocks)
          });
      }
    }

    return formattedMessages;
  }

  getContent(blocks) {
    const content = [];

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          content.push({ type: 'text', text: block.content });
          break;
        case 'tool_use':
          content.push({ type: 'tool_use', name: block.tool, input: block.content });
          break;
        case 'tool_result':
          content.push({
            type: 'tool_result',
            content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content)
          });
          break;
      }
    }

    return content;
  }

  getTextContent(blocks) {
    return blocks.map(block => block.content).join('\n');
  }

  getRole(sender) {
    switch (sender) {
      case 'tool':
      case 'user_system':
        return 'user';
      default:
        return sender;
    }
  }
}

module.exports = new GoogleService();
