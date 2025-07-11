class ToolFormatterService {
  formatToolForProvider(toolDefinition, provider) {
    if (['alibaba', 'deepseek', 'moonshot', 'openai'].includes(provider)) {
      return this.formatToolForOpenAI(toolDefinition);
    } else if (provider === 'google') {
      return this.formatToolForGoogle(toolDefinition);
    } else {
      // Formato padrão é Anthropic
      return this.formatToolForAnthropic(toolDefinition);
    }
  }

  formatToolForOpenAI(toolDefinition) {
    return {
      type: 'function',
      function: {
        name: toolDefinition.name,
        description: toolDefinition.description,
        parameters: {
          ...toolDefinition.input_schema,
          // Garantir que propriedades específicas do OpenAI existam
          additionalProperties: toolDefinition.input_schema.additionalProperties || false,
        }
      }
    };
  }

  formatToolForAnthropic(toolDefinition) {
    // O formato interno já é baseado no Anthropic, então apenas retornamos a definição
    return toolDefinition;
  }

  formatToolForGoogle(toolDefinition) {
    return {
      function: {
        name: toolDefinition.name,
        description: toolDefinition.description,
        parameters: toolDefinition.input_schema
      }
    };
  }
}

module.exports = new ToolFormatterService();
