const OpenAIProvider = require('../providers/open-ai.provider');
const alibabaProvider = require('../providers/alibaba.provider');
const anthropicProvider = require('../providers/anthropic.provider');
const assistantsStore = require('../stores/assistants.store');
const deepSeekProvider = require('../providers/deep-seek.provider');
const fileEditTool = require("../tools/file-edit.tool");
const fileMultiEditTool = require("../tools/file-multi-edit.tool");
const fileReadTool = require("../tools/file-read.tool");
const fileWriteTool = require("../tools/file-write.tool");
const globTool = require("../tools/glob.tool");
const googleProvider = require('../providers/google.provider');
const grepTool = require("../tools/grep.tool");
const lsTool = require("../tools/ls.tool");
const openRouterProvider = require('../providers/open-router.provider');
const projectsStore = require("../stores/projects.store");
const promptParserService = require("./prompt-parser.service");
const reportTool = require("../tools/report.tool");
const toolFormatterService = require("./tool-formatter.service");
const workerManager = require("./worker.manager");

const TOOLS = [
  fileEditTool,
  fileMultiEditTool,
  fileReadTool,
  fileWriteTool,
  globTool,
  grepTool,
  lsTool,
  reportTool,
];

class WorkerService {
  async job(conversation, prompt, cancelationToken) {
    cancelationToken.throwIfCanceled();
    workerManager.workerStarted(conversation);
    workerManager.workerRunning(conversation);

    const systemMessage = await this.getSystemMessage(conversation, prompt);
    const messages = [systemMessage]
    return new Promise((resolve, reject) => {
      try {
        this.runJob(conversation, messages, cancelationToken, resolve, reject)
      } catch (error) {
        reject(error);
      }
    });
  }

  async runJob(conversation, messages, cancelationToken, resolve, reject) {
    cancelationToken.throwIfCanceled();
    workerManager.workerSessionMessagesCount(conversation, messages.length);

    if (messages.length > 50) throw new Error("Worker job caused too many conversation turns (50 max)");
    if (!conversation?.assistantId) throw new Error("Conversation has no assistant");
    const assistant = await assistantsStore.getById(conversation.assistantId);
    if (!assistant) throw new Error("Assistant not found");
    if (!assistant.provider) throw new Error("Assistant has no provider");

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
      case 'openrouter':
        providerService = openRouterProvider;
        break;
    }

    const toolDefinitions = TOOLS.map(tool => {
      const baseDefinition = tool.getDefinition();
      return toolFormatterService.formatToolForProvider(baseDefinition, assistant.provider);
    });

    const assistantMessage = {
      id: `${ new Date().getTime() }`,
      sender: 'assistant',
      blocks: [],
    };

    messages.push(assistantMessage);

    await providerService.chatCompletion(
      assistant,
      messages,
      cancelationToken,
      toolDefinitions,
      (event) => this.receiveStream(
        conversation,
        messages,
        assistantMessage,
        event,
        cancelationToken,
        resolve,
        reject
      ));
  }

  async getSystemMessage(conversation, prompt) {
    const project = await projectsStore.getById(conversation.projectId);
    const workerPrompt = './assets/prompts/worker.md';
    const systemPrompt = await promptParserService.parsePrompt(workerPrompt, { prompt, project });
    const now = new Date();

    return {
      id: `${ now.getTime() }`,
      sender: 'user_system',
      blocks: [{ id: `${ now.getTime() + 1 }`, type: 'text', content: systemPrompt }]
    };
  }

  async receiveStream(conversation, messages, assistantMessage, event, cancelationToken, resolve, reject) {
    try {
      cancelationToken.throwIfCanceled();
      const type = event.type;

      switch (type) {
        case 'block_start':
          return this.createBlock(assistantMessage, event);
        case 'block_delta':
          return this.appendBlockContent(conversation, assistantMessage, event.delta);
        case 'message_stop':
          return await this.finishMessage(conversation, messages, assistantMessage, cancelationToken, resolve, reject);
      }
    } catch (error) {
      reject(error);
    }
  }

  async finishMessage(conversation, messages, assistantMessage, cancelationToken, resolve, reject) {
    if (assistantMessage.blocks.some(b => b.type === 'tool_use')) {
      await this.useTool(conversation, messages, assistantMessage, cancelationToken, resolve, reject);
    } else {
      const report = this.getReportFromMessage(assistantMessage);
      resolve(report);
    }
  }

  getReportFromMessage(assistantMessage) {
    if (!assistantMessage?.blocks?.length) return { report: '*** No report generated by worker agent ***' };
    const textBlocks = assistantMessage.blocks.filter(b => b.type === 'text').map(b => b.content);
    return { report: textBlocks.join('\n') };
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
  }

  async appendBlockContent(conversation, assistantMessage, content) {
    const lastBlock = assistantMessage.blocks[assistantMessage.blocks.length - 1];
    lastBlock.content += content ?? '';
  }

  async useTool(conversation, messages, assistantMessage, cancelationToken, resolve, reject) {
    const toolUseBlocks = assistantMessage.blocks.filter(b => b.type === 'tool_use');
    const toolResults = [];

    for (const toolBlock of toolUseBlocks) {
      const tool = TOOLS.find(tool => tool.getDefinition().name === toolBlock.tool);
      let result;

      try {
        if (typeof toolBlock.content === 'string') {
          toolBlock.content = JSON.parse(toolBlock.content);
        }

        result = await tool.executeTool(conversation, toolBlock.content, cancelationToken);

        if (toolBlock.tool === 'report') {
          return resolve(result);
        }

        await new Promise(x => setTimeout(x, 100));
      } catch (e) {
        result = { error: e.message, isError: true };
      }

      toolResults.push({
        tool: toolBlock.tool,
        toolUseId: toolBlock.toolUseId,
        result: result,
        isError: result.isError
      });
    }

    const toolMessage = {
      id: `${ new Date().getTime() }`,
      sender: 'tool',
      blocks: toolResults.map(result => ({
        type: 'tool_result',
        tool: result.tool,
        toolUseId: result.toolUseId,
        content: result.result,
        isError: result.isError
      }))
    };

    messages.push(toolMessage);
    await this.runJob(conversation, messages, cancelationToken, resolve, reject);
  }
}

module.exports = new WorkerService();
