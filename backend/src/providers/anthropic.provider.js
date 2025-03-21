const { Anthropic } = require('@anthropic-ai/sdk');
const settingsStore = require('../stores/settings.store');

class AnthropicProvider {
  async chatCompletion(assistent, messages, cancelationToken, tools, streamCallback) {
    if (cancelationToken.isCanceled()) {
      return;
    }

    const formattedMessages = this.getMessages(messages);
    const settings = await settingsStore.getSettings();
    const apiKey = settings.anthropic.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const anthropic = new Anthropic({ apiKey: apiKey, });

    try {
      const stream = await anthropic.messages.create({
        messages: formattedMessages,
        model: assistent.model,
        max_tokens: 8192,
        stream: true,
        tools: tools,
      });

      for await (const event of stream) {
        if (cancelationToken.isCanceled()) {
          return stream.controller.abort();
        }

        this.translateStreamEvent(event, streamCallback);
      }
    } finally {
      streamCallback({ type: 'message_stop' });
    }
  }

  translateStreamEvent(event, streamCallback) {
    const type = event.type;

    switch (type) {
      case 'message_start':
        streamCallback({ type: 'message_start', inputTokens: event.message.usage.input_tokens });
        break;
      case 'content_block_start':
        switch (event.content_block.type) {
          case 'text':
            streamCallback({ type: 'block_start', blockType: event.content_block.type });
            break
          case 'tool_use':
            streamCallback({
              type: 'block_start',
              blockType: event.content_block.type,
              tool: event.content_block.name,
              toolUseId: event.content_block.id,
              content: '',
            });
            break
        }
        break;
      case 'content_block_stop':
        streamCallback({ type: 'block_stop' });
        break;
      case 'content_block_delta':
        switch (event.delta.type) {
          case 'text_delta':
            streamCallback({ type: 'block_delta', delta: event.delta.text });
            break;
          case 'input_json_delta':
            streamCallback({ type: 'block_delta', delta: event.delta.partial_json });
            break;
        }
        break;
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
        case 'log':
          break;
        default:
          formattedMessages.push({
            role: this.getRole(message.sender),
            content: this.getContent(message.blocks)
          })
      }
    }

    return formattedMessages;
  }

  getContent(blocks) {
    const content = []

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          content.push({ type: 'text', text: block.content });
          break;
        case 'tool_use':
          content.push({ type: 'tool_use', id: block.toolUseId, name: block.tool, input: JSON.parse(block.content) });
          break;
        case 'tool_result':
          content.push({
            type: 'tool_result',
            tool_use_id: block.toolUseId,
            content: JSON.stringify(block.content),
            is_error: block.isError
          });
          break;
      }
    }

    return content;
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

module.exports = new AnthropicProvider();
