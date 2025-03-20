const { GoogleGenerativeAI } = require('@google/generative-ai');
const settingsStore = require('../stores/settings.store');

class GoogleProvider {
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

    streamCallback({ type: 'message_start', inputTokens: 0 });

    try {

      const result = await model.generateContentStream({
        contents: formattedMessages,
        tools: this.formatTools(tools),
      });

      const currentBlock = {};

      for await (const chunk of result.stream) {
        if (cancelationToken.isCanceled()) {
          throw new Error('Stream canceled');
        }

        await this.translateStreamEvent(chunk, currentBlock, streamCallback);
      }
    } finally {
      streamCallback({ type: 'message_stop' });
    }
  }

  translateStreamEvent(chunk, currentBlock, streamCallback) {
    if (chunk.candidates?.length === 0 || !chunk.candidates) return;
    const candidate = chunk.candidates[0];

    // Se não há conteúdo, ignoramos este chunk
    if (!candidate.content) return;
    const content = candidate.content;

    // Se não há partes, ignoramos
    if (!content.parts || !content.parts.length) return;
    const parts = content.parts[0];

    // Se não há texto ou chamada de função, ignoramos
    if (!parts.text && !parts.functionCall) return;

    if (parts.functionCall) {
      currentBlock.isOpen = false;
      const functionCall = parts.functionCall;
      return streamCallback({
        type: 'block_start',
        blockType: 'tool_use',
        tool: functionCall.name,
        toolUseId: `google-function-${ Date.now() }`,
        content: functionCall.args
      });
    }


    if (!currentBlock.isOpen && parts.text) {
      currentBlock.isOpen = true;
      return streamCallback({ type: 'block_start', blockType: 'text', content: parts.text ?? '' });
    }

    if (currentBlock.isOpen && parts.text) {
      return streamCallback({ type: 'block_delta', delta: parts.text });
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

  getMessages(messages) {
    const formattedMessages = [];

    for (const message of messages) {
      if (!message.blocks?.length) {
        continue;
      }

      switch (message.sender) {
        case 'system':
          formattedMessages.push({
            role: 'user',
            parts: [{ text: this.getTextContent(message.blocks) }]
          });
          break;
        case 'log':
          break;
        default:
          const formattedMessage = {
            role: this.getRole(message.sender),
            parts: []
          };

          for (const block of message.blocks) {
            switch (block.type) {
              case 'text':
                if (block.content?.trim()) {
                  formattedMessage.parts.push({ text: block.content });
                }
                break;
              case 'tool_use':
                formattedMessage.parts.push({
                  functionCall: {
                    name: block.tool,
                    args: block.content
                  }
                });
                break;
              case 'tool_result':
                // Para resultados de ferramentas, o Google usa uma estrutura diferente
                formattedMessage.role = 'user';
                formattedMessage.parts = [{
                  functionResponse: {
                    name: block.tool,
                    response: {
                      name: block.tool,
                      content: block.content
                    }
                  }
                }];
                break;
            }
          }

          // Se não tiver partes, adiciona um texto vazio
          if (formattedMessage.parts.length) {
            formattedMessages.push(formattedMessage);
          }
      }
    }

    return formattedMessages;
  }

  getTextContent(blocks) {
    return blocks.map(block => block.content).join('\n');
  }

  getRole(sender) {
    switch (sender) {
      case 'tool':
      case 'user_system':
        return 'user';
      case 'assistant':
        return 'model';
      default:
        return sender;
    }
  }
}

module.exports = new GoogleProvider();
