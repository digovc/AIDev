import { ApiBase } from './api.base';

class TasksApi extends ApiBase {
  constructor() {
    super();
    this.baseUrl = '/tasks';
  }

  async getTaskById(taskId) {
    return this.client.get(`${ this.baseUrl }/${ taskId }`);
  }

  async getTasksByProjectId(projectId) {
    return this.client.get(`${ this.baseUrl }/project/${ projectId }`);
  }

  async createTask(taskData) {
    return this.client.post(this.baseUrl, taskData);
  }

  async updateTask(taskId, taskData) {
    return this.client.put(`${ this.baseUrl }/${ taskId }`, taskData);
  }

  async deleteTask(taskId) {
    return this.client.delete(`${ this.baseUrl }/${ taskId }`);
  }

  async runTask(taskId) {
    return this.client.post(`${ this.baseUrl }/run/${ taskId }`);
  }

  async stopTask(taskId) {
    return this.client.post(`${ this.baseUrl }/stop/${ taskId }`);
  }

  async archiveTasks(projectId, taskIds) {
    return this.client.post(`${ this.baseUrl }/archive`, { projectId, taskIds });
  }

  async completeTask(taskId) {
    return this.client.post(`${ this.baseUrl }/complete/${ taskId }`);
  }

  async getWorkers(taskId) {
    return this.client.get(`${ this.baseUrl }/${ taskId }/workers`);
  }

  async getRunningTasks() {
    return this.client.get(`${ this.baseUrl }/running`);
  }
}

export const tasksApi = new TasksApi();
