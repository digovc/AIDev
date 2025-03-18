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
    const model = genAI.getGenerativeModel({ model: assistent.model || 'gemini-2.0-flash' });

    const promptContent = this.buildPromptContent(formattedMessages);

    try {
      streamCallback({ type: 'message_start', inputTokens: 0 }); // Google API não fornece contagem de tokens

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: promptContent }] }],
        tools: this.formatTools(tools),
      });

      let isFirstChunk = true;

      for await (const chunk of result.stream) {
        if (cancelationToken.isCanceled()) {
          return result.stream.cancel();
        }

        // Iniciamos o bloco de texto na primeira mensagem
        if (isFirstChunk) {
          streamCallback({ type: 'block_start', blockType: 'text' });
          isFirstChunk = false;
        }

        await this.translateStreamEvent(chunk, streamCallback);
      }
    } finally {
      streamCallback({ type: 'message_stop' });
    }
  }

  translateStreamEvent(chunk, streamCallback) {
    if (chunk.candidates?.length === 0 || !chunk.candidates) return;
    const candidate = chunk.candidates[0];

    // Se não há conteúdo, ignoramos este chunk
    if (!candidate.content) return;

    const content = candidate.content;
    const parts = content.parts[0];

    // Verificamos se é uma chamada de função
    if (parts.functionCall) {
      const functionCall = parts.functionCall;

      // Se temos um finishReason STOP, significa que esta é a mensagem completa da função
      if (candidate.finishReason === 'STOP') {
        streamCallback({
          type: 'block_start',
          blockType: 'tool_use',
          tool: functionCall.name,
          toolUseId: `google-function-${Date.now()}`, // Geramos um ID único
          content: JSON.stringify(functionCall.args)
        });

        // Indicamos que o bloco está completo
        streamCallback({ type: 'block_stop' });
      }
    }
    // Se é texto normal
    else if (parts.text) {
      // Enviamos o texto como delta
      streamCallback({
        type: 'block_delta',
        delta: parts.text
      });
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
