const OpenAIProvider = require('../providers/open-ai.provider');
const agentTool = require("../tools/worker.tool");
const alibabaProvider = require('../providers/alibaba.provider');
const anthropicProvider = require('../providers/anthropic.provider');
const assistantsStore = require('../stores/assistants.store');
const deepSeekProvider = require('../providers/deep-seek.provider');
const moonshotProvider = require('../providers/moonshot.provider');
const fileEditTool = require("../tools/file-edit.tool");
const fileMultiEditTool = require("../tools/file-multi-edit.tool");
const file_read_tool = require("../tools/file-read.tool");
const fileWriteTool = require("../tools/file-write.tool");
const globTool = require("../tools/glob.tool");
const googleProvider = require('../providers/google.provider');
const grepTool = require("../tools/grep.tool");
const lsTool = require("../tools/ls.tool");
const messagesStore = require('../stores/messages.store');
const openRouterProvider = require('../providers/open-router.provider');
const socketIOService = require("./socket-io.service");
const task_list_tool = require("../tools/task-list.tool");
const taskWriteTool = require("../tools/task-write.tool");
const todoReadTool = require("../tools/todo-read.tool");
const todoWriteTool = require("../tools/todo-write.tool");
const toolFormatterService = require("./tool-formatter.service");

const TOOLS = [
  agentTool,
  fileEditTool,
  fileMultiEditTool,
  file_read_tool,
  fileWriteTool,
  globTool,
  grepTool,
  lsTool,
  task_list_tool,
  taskWriteTool,
  todoReadTool,
  todoWriteTool,
];

class AgentService {
  async sendMessage(conversation, cancelationToken) {
    if (!conversation?.assistantId) throw new Error("Conversation has no assistant");

    const messages = await messagesStore.getByConversationId(conversation.id);

    const assistantMessage = {
      id: `${ new Date().getTime() }`,
      conversationId: conversation.id,
      sender: 'assistant',
      blocks: [],
    };

    await messagesStore.create(assistantMessage);

    const assistant = await assistantsStore.getById(conversation.assistantId);

    let providerService = new OpenAIProvider();

    switch (assistant.provider) {
      case 'alibaba':
        providerService = alibabaProvider;
        break;
      case 'anthropic':
        providerService = anthropicProvider;
        break;
      case 'google':
        providerService = googleProvider;
        break;
      case 'deepseek':
        providerService = deepSeekProvider;
        break;
      case 'moonshot':
        providerService = moonshotProvider;
        break;
      case 'openrouter':
        providerService = openRouterProvider;
        break;
    }

    // Formatar as definições de ferramentas de acordo com o provedor em uso
    const toolDefinitions = TOOLS.map(tool => {
      const baseDefinition = tool.getDefinition();
      return toolFormatterService.formatToolForProvider(baseDefinition, assistant.provider);
    });

    await providerService.chatCompletion(
      assistant,
      messages,
      cancelationToken,
      toolDefinitions,
      (event) => this.receiveStream(conversation, cancelationToken, assistantMessage, event));
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

  async receiveStream(conversation, cancelationToken, assistantMessage, event) {
    try {
      const type = event.type;

      switch (type) {
        case 'block_start':
          return this.createBlock(assistantMessage, event);
        case 'block_delta':
          return this.appendBlockContent(conversation, assistantMessage, event.delta);
        case 'message_stop':
          return await this.finishMessage(conversation, cancelationToken, assistantMessage);
      }
    } catch (e) {
      const message = `Erro ao processar stream: ${ e.message }`;
      cancelationToken.cancel();
      await this.logError(conversation, { message });
    }
  }

  async finishMessage(conversation, cancelationToken, assistantMessage) {
    await messagesStore.update(assistantMessage.id, assistantMessage);

    if (assistantMessage.blocks.some(b => b.type === 'tool_use')) {
      await this.useTool(conversation, cancelationToken, assistantMessage);
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
      content: event.content ?? ''
    };

    assistantMessage.blocks.push(block);
    socketIOService.io.emit('block-created', block);
    await messagesStore.update(assistantMessage.id, assistantMessage);
  }

  async appendBlockContent(conversation, assistantMessage, content) {
    const lastBlock = assistantMessage.blocks[assistantMessage.blocks.length - 1];
    lastBlock.content += content ?? '';

    socketIOService.io.emit('block-delta', {
      id: lastBlock.id,
      taskId: conversation.taskId,
      messageId: lastBlock.messageId,
      delta: content ?? ''
    });
  }

  async processToolBlock(toolBlock, conversation, cancelationToken) {
    const tool = TOOLS.find(tool => tool.getDefinition().name === toolBlock.tool);
    try {
      if (typeof toolBlock.content === 'string') {
        toolBlock.content = JSON.parse(toolBlock.content);
      }

      const result = await tool.executeTool(conversation, toolBlock.content, cancelationToken);

      return {
        tool: toolBlock.tool,
        toolUseId: toolBlock.toolUseId,
        result: result,
        isError: result.isError
      };
    } catch (e) {
      return {
        tool: toolBlock.tool,
        toolUseId: toolBlock.toolUseId,
        result: { error: e.message, isError: true },
        isError: true
      };
    }
  }

  async useTool(conversation, cancelationToken, assistantMessage) {
    const toolUseBlocks = assistantMessage.blocks.filter(b => b.type === 'tool_use');
    const toolResults = [];

    // Separate worker and non-worker tools
    const workerBlocks = [];
    const nonWorkerBlocks = [];

    for (const toolBlock of toolUseBlocks) {
      if (toolBlock.tool === 'worker') {
        workerBlocks.push(toolBlock);
      } else {
        nonWorkerBlocks.push(toolBlock);
      }
    }

    // Process non-worker tools sequentially
    for (const toolBlock of nonWorkerBlocks) {
      const result = await this.processToolBlock(toolBlock, conversation, cancelationToken);
      toolResults.push(result);
    }

    // Process worker tools in parallel
    if (workerBlocks.length > 0) {
      const workerPromises = workerBlocks.map(toolBlock =>
        this.processToolBlock(toolBlock, conversation, cancelationToken)
      );
      const workerResults = await Promise.all(workerPromises);
      toolResults.push(...workerResults);
    }

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
    await this.sendMessage(conversation, cancelationToken);
  }
}

module.exports = new AgentService();
