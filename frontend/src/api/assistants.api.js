import axios from 'axios';
import { ApiBase } from "@/api/api.base.js";

class AssistantsApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/assistants';
  }

  async createAssistant(assistant) {
    return this.client.post(`/assistants`, assistant);
  }

  async updateAssistant(id, assistant) {
    return this.client.put(`/assistants/${id}`, assistant);
  }

  async listAssistants() {
    return this.client.get(`/assistants`);
  }

  async deleteAssistant(id) {
    return this.client.delete(`/assistants/${id}`);
  }
}


export const assistantsApi = new AssistantsApi();
