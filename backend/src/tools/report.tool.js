const { readFileSync } = require("node:fs");
const { join } = require("node:path");

class ReportTool {
  DESCRIPTION = readFileSync(join(__dirname, "./report.txt"), "utf8");

  getDefinition() {
    return {
      name: "report",
      description: this.DESCRIPTION,
      input_schema: {
        type: "object",
        required: ["report", "status"],
        properties: {
          report: {
            description: "The report to send to the manager",
            type: "string"
          },
          status: {
            description: "The status of the report",
            type: "string",
            enum: [
              "success",
              "failure"
            ]
          }
        }
      }
    }
  };

  async executeTool(conversation, input) {
    return {
      report: input.report,
      status: input.status
    }
  }
}

module.exports = new ReportTool();
