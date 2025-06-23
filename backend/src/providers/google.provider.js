const { GoogleGenAI } = require('@google/genai');
const settingsStore = require('../stores/settings.store');

class GoogleProvider {
  async chatCompletion(assistant, messages, cancelationToken, tools, streamCallback) {
    cancelationToken.throwIfCanceled();

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings.gemini.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const genAI = new GoogleGenAI({ apiKey });

    await streamCallback({ type: 'message_start', inputTokens: 0 });

    const toolsFormatted = this.formatTools(tools);

    let retryCount = 0;
    let waitTime = 1000; // 1 second
    let result;

    while (retryCount < 5) {
      try {
        result = await genAI.models.generateContentStream({
          model: assistant.model || 'gemini-2.5-flash',
          contents: formattedMessages,
          config: {
            temperature: 1,
            topP: 1,
            tools: [{ functionDeclarations: toolsFormatted }],
            thinkingConfig: {
              includeThoughts: true
            },
          }
        });

        const currentBlock = {};

        for await (const chunk of result) {
          cancelationToken.throwIfCanceled();
          await this.translateStreamEvent(chunk, currentBlock, streamCallback);
        }

        streamCallback({ type: 'message_stop' });
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount >= 5) {
          throw error; // Max retries reached, rethrow the error
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
        waitTime *= 2; // Double the wait time for the next retry
      }
    }
  }

  async translateStreamEvent(chunk, currentBlock, streamCallback) {
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

    if (currentBlock.isOpen && currentBlock.type === 'reasoning' && !parts.thought) {
      currentBlock.isOpen = false;
      currentBlock.type = undefined;
      currentBlock.toolUseId = undefined;
    }

    if (parts.functionCall) {
      currentBlock.isOpen = false;
      const functionCall = parts.functionCall;
      return await streamCallback({
        type: 'block_start',
        blockType: 'tool_use',
        tool: functionCall.name,
        toolUseId: `google-function-${ Date.now() }`,
        content: functionCall.args
      });
    }

    if (!currentBlock.isOpen && parts.text) {
      const type = parts.thought ? 'reasoning' : 'text';
      currentBlock.isOpen = true;
      currentBlock.type = type;
      return await streamCallback({ type: 'block_start', blockType: type, content: parts.text ?? '' });
    }

    if (currentBlock.isOpen && parts.text) {
      return await streamCallback({ type: 'block_delta', delta: parts.text });
    }
  }

  formatTools(tools) {
    if (!tools || !tools.length) return [];

    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters
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
                    response: { result: block.content }
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
