const workerService = require("../services/worker.service");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

class WorkerTool {
  DESCRIPTION = readFileSync(join(__dirname, "./worker.txt"), "utf8");

  getDefinition() {
    return {
      name: "worker",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["prompt"],
        properties: {
          prompt: {
            type: "string",
            description: "The prompt to send to the worker"
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
      throw new Error(`Error on worker: ${ error }`);
    }
  }
}

module.exports = new WorkerTool();
