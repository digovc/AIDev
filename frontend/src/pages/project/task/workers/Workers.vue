<template>
  <div class="p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkerCard
        v-for="worker in workers"
        :key="worker.conversationId"
        :worker="worker"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { tasksApi } from '@/api/tasks.api.js';
import { socketIOService } from '@/services/socket.io.js';
import WorkerCard from './WorkerCard.vue';

const route = useRoute();
const taskId = route.params.taskId;
const workers = ref([]);

const addWorker = (conversationId) => {
  if (!workers.value.find(w => w.conversationId === conversationId)) {
    workers.value.push({
      conversationId,
      status: 'started',
      messagesCount: 0,
    });
  }
};

const updateWorkerStatus = (conversationId, status) => {
  const worker = workers.value.find(w => w.conversationId === conversationId);
  if (worker) worker.status = status;
};

const updateWorkerMessagesCount = (conversationId, count) => {
  const worker = workers.value.find(w => w.conversationId === conversationId);
  if (worker) worker.messagesCount = count;
};

const removeWorker = (conversationId) => {
  updateWorkerStatus(conversationId, 'finished');
};

const handleWorkerStarted = (data) => {
  if (String(data.taskId) !== String(taskId)) return;
  addWorker(data.conversationId);
};

const handleWorkerRunning = (data) => {
  if (String(data.taskId) !== String(taskId)) return;
  updateWorkerStatus(data.conversationId, 'running');
};

const handleWorkerFinished = (data) => {
  if (String(data.taskId) !== String(taskId)) return;
  removeWorker(data.conversationId);
};

const handleWorkerMessagesCount = (data) => {
  if (String(data.taskId) !== String(taskId)) return;
  updateWorkerMessagesCount(data.conversationId, data.count);
};

onMounted(async () => {
  try {
    const response = await tasksApi.getWorkers(taskId);
    const initial = response.data;
    if (Array.isArray(initial)) {
      initial.forEach(conversationId => {
        addWorker(conversationId);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar workers:', error);
  }

  const socket = socketIOService.socket;
  socket.on('worker-started', handleWorkerStarted);
  socket.on('worker-running', handleWorkerRunning);
  socket.on('worker-finished', handleWorkerFinished);
  socket.on('worker-session-messages-count', handleWorkerMessagesCount);
});

onUnmounted(() => {
  const socket = socketIOService.socket;
  socket.off('worker-started', handleWorkerStarted);
  socket.off('worker-running', handleWorkerRunning);
  socket.off('worker-finished', handleWorkerFinished);
  socket.off('worker-session-messages-count', handleWorkerMessagesCount);
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
