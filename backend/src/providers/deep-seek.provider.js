const OpenAI = require('openai');
const settingsStore = require('../stores/settings.store');

class DeepSeekProvider {
  async chatCompletion(assistent, messages, cancelationToken, tools, streamCallback) {
    if (cancelationToken.isCanceled()) {
      return;
    }

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings.deepseek.apiKey;
    const baseURL = 'https://api.deepseek.com';

    if (!apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    streamCallback({ type: 'message_start', inputTokens: 0 });

    try {
      const stream = await openai.chat.completions.create({
        messages: formattedMessages,
        model: assistent.model,
        stream: true,
        tools: tools,
      });

      const currentBlock = {}

      for await (const chunk of stream) {
        if (cancelationToken.isCanceled()) {
          throw new Error('Stream canceled');
        }

        this.translateStreamEvent(chunk, currentBlock, streamCallback);
      }
    } finally {
      streamCallback({ type: 'message_stop' });
    }

  }

  translateStreamEvent(chunk, currentBlock, streamCallback) {
    if (!chunk.choices || !chunk.choices.length) return;
    const choice = chunk.choices[0];

    if (!choice.delta) return;
    const delta = choice.delta;

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

      if (!delta.tool_calls || !delta.tool_calls.length) {
        currentBlock.type = 'text';
        currentBlock.toolUseId = undefined;
        return streamCallback({ type: 'block_start', blockType: 'text', content: delta.content ?? '' });
      }

      if (delta.tool_calls && delta.tool_calls.length) {
        const toolCall = delta.tool_calls[0];

        currentBlock.type = 'tool_use';
        currentBlock.toolUseId = toolCall.id;

        return streamCallback({
          type: 'block_start',
          blockType: 'tool_use',
          tool: toolCall.function.name,
          toolUseId: toolCall.id,
          content: toolCall.function.arguments,
        });
      }
    }

    if (currentBlock.isOpen && currentBlock.type === 'text' && delta.content) {
      return streamCallback({ type: 'block_delta', delta: delta.content });
    }

    if (currentBlock.isOpen && currentBlock.type === 'tool_use' && delta.tool_calls?.length && !delta.tool_calls[0].id) {
      const toolCall = delta.tool_calls[0];
      return streamCallback({ type: 'block_delta', delta: toolCall.function.arguments });
    }

    if (currentBlock.isOpen && currentBlock.type === 'tool_use' && delta.tool_calls?.length && currentBlock.toolUseId !== delta.tool_calls[0].id) {
      const toolCall = delta.tool_calls[0];
      currentBlock.toolUseId = toolCall.id;
      streamCallback({ type: 'block_stop' });

      return streamCallback({
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
      if (!message.blocks?.length) {
        continue;
      }

      if (message.sender === 'log') {
        continue;
      }

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

      for (const block of message.blocks) {
        switch (block.type) {
          case 'text':
            if (!block.content || !block.content.trim()) {
              continue;
            }
            formattedMessage.content = formattedMessage.content || [];
            formattedMessage.content.push({ type: 'text', text: block.content });
            break;
          case 'tool_use':
            const toolCall = {
              id: block.toolUseId,
              type: 'function',
              function: {
                name: block.tool,
                arguments: block.content
              }
            };

            formattedMessage.tool_calls = formattedMessage.tool_calls || [];
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

      if (formattedMessage.empty) {
        continue;
      }

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
        return 'toll';
      case 'user_system':
        return 'user';
      default:
        return sender;
    }
  }
}

module.exports = new DeepSeekProvider();