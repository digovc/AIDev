const workerService = require("../services/worker.service");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

class AgentTool {
  DESCRIPTION = readFileSync(join(__dirname, "./agent.txt"), "utf8");

  getDefinition() {
    return {
      name: "agent",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: {
            type: "string",
            description: "The prompt to send to the agent"
          }
        }
      }
    }
  };

  async executeTool(conversation, input, cancelationToken) {
    cancelationToken.throwIfCanceled();
    if (!input.prompt) throw new Error("The parameter prompt is required");

    try {
      return await workerService.job(conversation, input.prompt, cancelationToken);
    } catch (error) {
      throw new Error(`Error on agent job: ${ error }`);
    }
  }
}

module.exports = new AgentTool();
