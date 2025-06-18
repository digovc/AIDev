import { ref } from "vue";
import { socketIOService } from "@/services/socket.io.js";
import { tasksApi } from "@/api/tasks.api";

class RunningTasksService {
  _runningTasks = ref([]);

  constructor() {
    socketIOService.socket.on('task-executing', (taskId) => {
      if (this._runningTasks.value.includes(taskId)) return;
      this._runningTasks.value.push(taskId);
    });

    socketIOService.socket.on('task-not-executing', (taskId) => {
      if (!this._runningTasks.value.includes(taskId)) return;
      this._runningTasks.value = this._runningTasks.value.filter(t => t !== taskId);
    });

    socketIOService.socket.on('block-delta', (blockDelta) => {
      const taskId = blockDelta.taskId;
      if (this._runningTasks.value.includes(taskId)) return;
      this._runningTasks.value.push(taskId);
    });

    socketIOService.on('connected', async () => {
      const runningTasks = await tasksApi.getRunningTasks();
      this.setRunningTasks(runningTasks.data);
    });

    socketIOService.on('disconnected', () => {
      this.clearRunningTasks();
    });
  }

  isRunning(taskId) {
    return this._runningTasks.value.includes(taskId);
  }

  clearRunningTasks() {
    this._runningTasks.value = [];
  }

  setRunningTasks(taskIds) {
    this._runningTasks.value = taskIds;
  }
}

export const runningTasksService = new RunningTasksService();
