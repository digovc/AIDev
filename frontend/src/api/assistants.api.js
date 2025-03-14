import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const assistantsApi = {
  async createAssistant(assistant) {
    return await axios.post(`${API_URL}/assistants`, assistant);
  },

  async updateAssistant(id, assistant) {
    return await axios.put(`${API_URL}/assistants/${id}`, assistant);
  },

  async listAssistants() {
    return await axios.get(`${API_URL}/assistants`);
  },

  async deleteAssistant(id) {
    return await axios.delete(`${API_URL}/assistants/${id}`);
  }
};