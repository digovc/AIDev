import { ApiBase } from './api.base';

class ProjectsApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/projects';
  }

  async getAllProjects() {
    return this.client.get(this.baseUrl);
  }

  async getProjectById(id) {
    return this.client.get(`${this.baseUrl}/${id}`);
  }

  async createProject(projectData) {
    return this.client.post(this.baseUrl, projectData);
  }

  async updateProject(id, projectData) {
    return this.client.put(`${this.baseUrl}/${id}`, projectData);
  }

  async deleteProject(id) {
    return this.client.delete(`${this.baseUrl}/${id}`);
  }
}

export const projectsApi = new ProjectsApi();
