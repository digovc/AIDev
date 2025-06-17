const OpenAI = require('openai');
const settingsStore = require('../stores/settings.store');

class OpenAICompatibleProvider {
  constructor(apiKeyPath, baseURL) {
    this.apiKeyPath = apiKeyPath;
    this.baseURL = baseURL;
  }

  async chatCompletion(assistant, messages, cancelationToken, tools, streamCallback) {
    cancelationToken.throwIfCanceled();

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings[this.apiKeyPath].apiKey;

    if (!apiKey) {
      throw new Error(`${ this.apiKeyPath } API key is required`);
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: this.baseURL,
    });

    await streamCallback({ type: 'message_start', inputTokens: 0 });

    const stream = await openai.chat.completions.create({
      messages: formattedMessages,
      model: assistant.model,
      stream: true,
      tools: tools,
    });

    const currentBlock = {}

    for await (const chunk of stream) {
      cancelationToken.throwIfCanceled();
      await this.translateStreamEvent(chunk, currentBlock, streamCallback);
    }

    await streamCallback({ type: 'message_stop' });
  }

  async translateStreamEvent(chunk, currentBlock, streamCallback) {
    if (!chunk.choices || !chunk.choices.length) return;
    const choice = chunk.choices[0];

    if (!choice.delta) return;
    const delta = choice.delta;

    if (currentBlock.isOpen && currentBlock.type === 'reasoning' && delta.content) {
      currentBlock.isOpen = false;
      currentBlock.type = undefined;
      currentBlock.toolUseId = undefined;
    }

    if (currentBlock.isOpen && currentBlock.type === 'text' && delta.tool_calls?.length) {
      currentBlock.isOpen = false;
      currentBlock.type = undefined;
      currentBlock.toolUseId = undefined;
    }

    if (currentBlock.isOpen && currentBlock.type === 'tool_use' && delta.content) {
      currentBlock.isOpen = false;
      currentBlock.type = undefined;
      currentBlock.toolUseId = undefined;
    }

    if (!currentBlock.isOpen) {
      currentBlock.isOpen = true;

      if (!delta.tool_calls?.length) {
        const type = delta.reasoning_content != null ? 'reasoning' : 'text';
        currentBlock.type = type;
        currentBlock.toolUseId = undefined;
        const content = delta.content ?? delta.reasoning_content ?? '';
        return await streamCallback({ type: 'block_start', blockType: type, content: content });
      }

      if (delta.tool_calls?.length) {
        const toolCall = delta.tool_calls[0];

        currentBlock.type = 'tool_use';
        currentBlock.toolUseId = toolCall.id;

        return await streamCallback({
          type: 'block_start',
          blockType: 'tool_use',
          tool: toolCall.function.name,
          toolUseId: toolCall.id,
          content: toolCall.function.arguments,
        });
      }
    }

    if (currentBlock.isOpen && currentBlock.type === 'reasoning' && delta.reasoning_content) {
      return await streamCallback({ type: 'block_delta', delta: delta.reasoning_content });
    }

    if (currentBlock.isOpen && currentBlock.type === 'text' && delta.content) {
      return await streamCallback({ type: 'block_delta', delta: delta.content });
    }

    if (currentBlock.isOpen && currentBlock.type === 'tool_use' && delta.tool_calls?.length && !delta.tool_calls[0].id) {
      const toolCall = delta.tool_calls[0];
      return await streamCallback({ type: 'block_delta', delta: toolCall.function.arguments });
    }

    if (currentBlock.isOpen && currentBlock.type === 'tool_use' && delta.tool_calls?.length && currentBlock.toolUseId !== delta.tool_calls[0].id) {
      const toolCall = delta.tool_calls[0];
      currentBlock.toolUseId = toolCall.id;
      await streamCallback({ type: 'block_stop' });

      return await streamCallback({
        type: 'block_start',
        blockType: 'tool_use',
        tool: toolCall.function.name,
        toolUseId: toolCall.id,
        content: toolCall.function.arguments,
      });
    }
  }

  getMessages(messages) {
    const formattedMessages = [];

    for (const message of messages) {
      if (message.sender === 'log') continue;
      if (!message.blocks?.length) continue;

      if (message.sender === 'system') {
        formattedMessages.push({
          role: 'system',
          content: this.getTextContent(message.blocks)
        });

        continue;
      }

      const formattedMessage = {
        role: this.getRole(message.sender),
      };

      const textBlocks = [];

      for (const block of message.blocks) {
        switch (block.type) {
          case 'text':
            if (!block.content || !block.content.trim()) continue;
            textBlocks.push(block.content);
            break;
          case 'tool_use':
            const args = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
            const toolCall = {
              id: block.toolUseId,
              type: 'function',
              function: {
                name: block.tool,
                arguments: args
              }
            };

            formattedMessage.tool_calls = formattedMessage.tool_calls ?? [];
            formattedMessage.tool_calls.push(toolCall);
            break;
          case 'tool_result':
            formattedMessage.empty = true;
            formattedMessages.push({
              role: 'tool',
              tool_call_id: block.toolUseId,
              content: JSON.stringify(block.content)
            });
            break;
        }
      }

      if (textBlocks.length > 0) {
        formattedMessage.content = textBlocks.join('\n');
      }

      if (formattedMessage.empty) continue;
      if (!formattedMessage.content && !formattedMessage.tool_calls) continue;

      formattedMessages.push(formattedMessage);
    }

    return formattedMessages;
  }

  getTextContent(blocks) {
    return blocks.map(block => block.content).join('\n');
  }

  getRole(sender) {
    switch (sender) {
      case 'tool':
        return 'tool';
      case 'user_system':
        return 'user';
      default:
        return sender;
    }
  }
}

module.exports = OpenAICompatibleProvider;
