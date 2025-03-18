const anthropicService = require('./anthropic.service');
const openAIService = require('./open-ai.service');
const googleService = require('./google.service');
const listFilesTool = require("../tools/list-files.tool");
const listTasksTool = require("../tools/list-tasks.tool");
const messagesStore = require('../stores/messages.store');
const readFileTool = require("../tools/read-file.tool");
const socketIOService = require("./socket-io.service");
const toolFormatterService = require("./tool-formatter.service");
const writeFileTool = require("../tools/write-file.tool");
const writeTaskTool = require("../tools/write-task.tool");
const assistantsStore = require('../stores/assistants.store');
const CancelationToken = require("./cancelation.token");

class AgentService {
  async sendMessage(conversation, cancelationToken) {
    const messages = await messagesStore.getByConversationId(conversation.id);

    const assistantMessage = {
      id: `${ new Date().getTime() }`,
      conversationId: conversation.id,
      sender: 'assistant',
      blocks: [],
    };

    await messagesStore.create(assistantMessage);

    const tools = [
      listFilesTool,
      listTasksTool,
      readFileTool,
      writeFileTool,
      writeTaskTool
    ];

    const assistant = await assistantsStore.getById(conversation.assistantId) || {
      provider: 'openai',
      model: 'gpt-4o-2024-08-06'
    };

    let providerService = openAIService;

    switch (assistant.provider) {
      case 'anthropic':
        providerService = anthropicService;
        break;
      case 'google':
        providerService = googleService;
        break;
    }

    // Formatar as definições de ferramentas de acordo com o provedor em uso
    const toolDefinitions = tools.map(tool => {
      const baseDefinition = tool.getDefinition();
      return toolFormatterService.formatToolForProvider(baseDefinition, assistant.provider);
    });

    await providerService.chatCompletion(assistant, messages, cancelationToken, toolDefinitions, (event) => this.receiveStream(conversation, cancelationToken, assistantMessage, tools, event));
  }

  async continueConversation(conversation) {
    try {
      await this.sendMessage(conversation, new CancelationToken(null, () => false));
    } catch (e) {
      await this.logError(conversation, e);
    }
  }

  async logError(conversation, error) {
    const errorMessage = {
      id: new Date().getTime(),
      conversationId: conversation.id,
      sender: 'log',
      timestamp: new Date().toISOString(),
      blocks: [{ type: 'text', content: `Erro ao continuar a conversa: ${ error.message }` }]
    }
    await messagesStore.create(errorMessage);
  }

  async receiveStream(conversation, cancelationToken, assistantMessage, tools, event) {
    try {
      const type = event.type;

      switch (type) {
        case 'message_start':
          assistantMessage.inputTokens = event.inputTokens;
          break;
        case 'message_stop':
          await this.finishMessage(conversation, cancelationToken, assistantMessage, tools);
          break;
        case 'block_start':
          return this.createBlock(assistantMessage, event);
        case 'block_delta':
          return this.appendBlockContent(assistantMessage, event.delta);
        case 'block_stop':
          return this.closeBlock(conversation, cancelationToken, assistantMessage);
      }
    } catch (e) {
      const message = `Erro ao processar stream: ${ e.message }`;
      await this.logError(conversation, { message });
    }
  }

  async finishMessage(conversation, cancelationToken, assistantMessage, tools) {
    await messagesStore.update(assistantMessage.id, assistantMessage);

    if (assistantMessage.blocks.some(b => b.type === 'tool_use')) {
      await this.useTool(conversation, cancelationToken, assistantMessage, tools);
    } else {
      return cancelationToken?.cancel();
    }
  }

  async createBlock(assistantMessage, event) {
    const block = {
      id: `${ new Date().getTime() }`,
      messageId: assistantMessage.id,
      type: event.blockType,
      tool: event.tool,
      toolUseId: event.toolUseId,
      content: event.content || ''
    };

    assistantMessage.blocks.push(block);
    socketIOService.io.emit('block-created', block);
  }

  async appendBlockContent(assistantMessage, content) {
    const lastBlock = assistantMessage.blocks[assistantMessage.blocks.length - 1];
    lastBlock.content += content;

    socketIOService.io.emit('block-delta', {
      id: lastBlock.id,
      messageId: lastBlock.messageId,
      delta: content
    });
  }

  async closeBlock(conversation, cancelationToken, assistantMessage) {
    const lastBlock = assistantMessage.blocks[assistantMessage.blocks.length - 1];

    if (lastBlock.type !== 'tool_use') {
      return await messagesStore.update(assistantMessage.id, assistantMessage);
    }

    if (['', undefined, null].includes(lastBlock.content?.trim())) {
      lastBlock.content = '{}';
    }

    lastBlock.content = JSON.parse(lastBlock.content);
    await messagesStore.update(assistantMessage.id, assistantMessage);
  }

  async useTool(conversation, cancelationToken, assistantMessage, tools) {
    // Coletar todos os blocos de uso de ferramentas
    const toolUseBlocks = assistantMessage.blocks.filter(b => b.type === 'tool_use');

    // Executar todas as ferramentas em paralelo
    const toolResults = await Promise.all(toolUseBlocks.map(async (toolBlock) => {
      const tool = tools.find(tool => tool.getDefinition().name === toolBlock.tool);
      let result;

      try {
        if (typeof toolBlock.content === 'string') {
          toolBlock.content = JSON.parse(toolBlock.content);
        }

        result = await tool.executeTool(conversation, toolBlock.content);
      } catch (e) {
        result = { error: e.message, isError: true };
      }

      return {
        tool: toolBlock.tool,
        toolUseId: toolBlock.toolUseId,
        result: result,
        isError: result.isError
      };
    }));

    // Criar mensagem de resultado das ferramentas
    const toolMessage = {
      id: `${ new Date().getTime() }`,
      conversationId: conversation.id,
      sender: 'tool',
      blocks: toolResults.map(result => ({
        type: 'tool_result',
        tool: result.tool,
        toolUseId: result.toolUseId,
        content: result.result,
        isError: result.isError
      }))
    };

    await messagesStore.create(toolMessage);

    try {
      await this.sendMessage(conversation, cancelationToken);
    } catch (error) {
      cancelationToken.cancel();
      await this.logError(conversation, error);
    }
  }
}

module.exports = new AgentService();
