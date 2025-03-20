const OpenAI = require('openai');
const settingsStore = require('../stores/settings.store');

class OpenAiProvider {
  async chatCompletion(assistent, messages, cancelationToken, tools, streamCallback) {
    if (cancelationToken.isCanceled()) {
      return;
    }

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    let apiKey = settings.openai.apiKey;
    let baseURL = undefined;

    if (assistent.provider === 'deepseek') {
      apiKey = settings.deepseek.apiKey;
      baseURL = 'https://api.deepseek.com';
    }

    if (!apiKey) {
      throw new Error('API key is required');
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
      currentBlock.type = delta.tool_calls ? 'tool_use' : 'text';

      if (currentBlock.type === 'text') {
        currentBlock.toolUseId = undefined;
        return streamCallback({ type: 'block_start', blockType: 'text', content: delta.content ?? '' });
      }

      if (currentBlock.type === 'tool_use' && delta.tool_calls && delta.tool_calls.length) {
        const toolCall = delta.tool_calls[0];
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
          const formattedMessage = {
            role: this.getRole(message.sender),
            content: []
          };

          for (const block of message.blocks) {
            switch (block.type) {
              case 'text':
                formattedMessage.content.push({ type: 'text', text: block.content });
                break;
              case 'tool_use':
                const toolCall = {
                  id: block.toolUseId,
                  type: 'function',
                  function: { name: block.tool, arguments: block.content }
                }

                delete formattedMessage.content;
                formattedMessage.tool_calls = [toolCall];
                break;
              case 'tool_result':
                formattedMessage.role = 'tool';
                formattedMessage.tool_call_id = block.toolUseId;
                formattedMessage.content = JSON.stringify(block.content);
                break;
            }
          }

          // If content is still an empty array, convert to string for simple text messages
          if (Array.isArray(formattedMessage.content) && formattedMessage.content.length === 0) {
            formattedMessage.content = '';
          } else if (Array.isArray(formattedMessage.content) && formattedMessage.content.length === 1 &&
            formattedMessage.content[0].type === 'text') {
            formattedMessage.content = formattedMessage.content[0].text;
          }

          formattedMessages.push(formattedMessage);
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
        return 'toll';
      case 'user_system':
        return 'user';
      default:
        return sender;
    }
  }
}

module.exports = new OpenAiProvider();
