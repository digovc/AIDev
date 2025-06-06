import axios from 'axios';

export const assistantsApi = {
  async createAssistant(assistant) {
    return await axios.post(`/assistants`, assistant);
  },

  async updateAssistant(id, assistant) {
    return await axios.put(`/assistants/${id}`, assistant);
  },

  async listAssistants() {
    return await axios.get(`/assistants`);
  },

  async deleteAssistant(id) {
    return await axios.delete(`/assistants/${id}`);
  }
};
