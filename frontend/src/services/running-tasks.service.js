import { ref } from "vue";
import { socketIOService } from "@/services/socket.io.js";

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
  }

  isRunning(taskId) {
    return this._runningTasks.value.includes(taskId);
  }
}

export const runningTasksService = new RunningTasksService();
