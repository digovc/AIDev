const DESCRIPTION = require('./agent.txt');

class AgentTool {
  getDefinition() {
    return {
      name: "agent",
      description: DESCRIPTION,
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

  async executeTool(conversation, input) {
    if (!input.prompt) throw new Error("The parameter prompt is required");
    throw new Error("The agent tool is not implemented yet");
  }
}

module.exports = new AgentTool();
