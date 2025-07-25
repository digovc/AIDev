<template>
  <div class="bg-gray-900 rounded-lg flex flex-col space-y-2">
    <form class="flex flex-col grow space-y-2">
      <div class="mb-4">
        <label for="description" class="form-label">Descrição</label>
        <textarea id="description" ref="descriptionInput" v-model="task.description" rows="15" class="form-input"></textarea>
      </div>

      <div class="grow flex flex-col">
        <div class="flex justify-between items-center pr-2">
          <label class="form-label">Referências</label>
          <FontAwesomeIcon :icon="faPlus" @click="openReferencesDialog" class="p-1 text-gray-400 hover:text-gray-200 cursor-pointer" tabindex="0" @keydown.enter="openReferencesDialog" @keydown.space="openReferencesDialog"/>
        </div>

        <div v-if="task.references.length === 0" class="text-gray-500 italic text-sm">
          Nenhuma referência adicionada
        </div>

        <div v-else class="space-y-2 pt-4 grow">
          <ReferenceComponent v-for="(ref, index) in task.references" :key="index" :reference="ref" @remove="removeReference(index)" @view="openFileViewDialog(ref)"/>
        </div>
      </div>

      <div class="pt-4">
        <label for="assistant" class="form-label">Assistente</label>
        <select id="assistant" v-model="task.assistantId" class="form-input">
          <option :value="null">Selecione um assistente</option>
          <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.id">
            {{ assistant.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-end space-x-1 pt-2">
        <button v-if="!isTaskRunning" type="button" @click="saveAndRunTask" class="btn btn-primary" :disabled="loading">
          <FontAwesomeIcon :icon="faPlay"/>
          <span class="hidden md:inline md:pl-2">Executar</span>
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading" @click="saveTask">
          <FontAwesomeIcon :icon="faSave"/>
          <span class="hidden md:inline md:pl-2">{{ loading ? 'Salvando...' : 'Salvar' }}</span>
        </button>
        <button v-if="isEditing" type="button" @click="duplicateTask" class="btn btn-secondary" :disabled="loading">
          <FontAwesomeIcon :icon="faCopy"/>
          <span class="hidden md:inline md:pl-2">Duplicar</span>
        </button>
        <button type="button" @click="goBack" class="btn btn-secondary">
          <FontAwesomeIcon :icon="faTimes"/>
          <span class="hidden md:inline md:pl-2">Voltar</span>
        </button>
      </div>
    </form>
    <ReferencesDialog ref="referencesDialog" :project="project" :task-references="task.references" @update:references="updateReferences"/>
    <FileViewDialog ref="fileViewDialog" :file="selectedFile"/>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tasksApi } from '@/api/tasks.api.js';
import ReferencesDialog from '@/pages/project/task/ReferencesDialog.vue';
import FileViewDialog from '@/pages/project/task/FileViewDialog.vue';
import ReferenceComponent from '@/components/ReferenceComponent.vue';
import { assistantsApi } from '@/api/assistants.api.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCopy, faPlay, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { conversationsApi } from '@/api/conversations.api.js';
import { socketIOService } from "@/services/socket.io.js";
import { runningTasksService } from "@/services/running-tasks.service.js";
import { shortcutService } from "@/services/shortcut.service.js";

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const assistants = ref([]);
const conversationTitle = ref(null);
const isEditing = ref(false);
const loading = ref(false);
const referencesDialog = ref(null);
const route = useRoute();
const router = useRouter();
const descriptionInput = ref(null);

const fileViewDialog = ref(null);
const selectedFile = ref({});

const task = reactive({
  id: null,
  description: '',
  status: 'backlog',
  references: [],
  assistantId: null
});

watch(() => route.params.taskId, async (newTaskId) => {
  if (newTaskId) {
    await loadTask();
  }
});

const emits = defineEmits(['task-closed', 'task-duplicated', 'task-started']);

const isTaskRunning = computed(() => {
  if (!task?.id) return false;
  return runningTasksService.isRunning(task.id);
});

const goBack = () => {
  emits('task-closed');
  router.push(`/projects/${ props.project.id }`);
};

const saveTask = async () => {
  try {
    loading.value = true;

    const taskData = {
      ...task,
      projectId: props.project.id
    };

    if (task.assistantId) {
      localStorage.setItem('defaultAssistantId', task.assistantId);
    }

    if (isEditing.value) {
      await tasksApi.updateTask(task.id, taskData);
    } else {
      const result = await tasksApi.createTask(taskData);
      task.id = result.data.id;
    }

    await router.push(`/projects/${ props.project.id }`);
  } catch (error) {
    console.error(`Erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } tarefa:`, error);
    alert(`Ocorreu um erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } a tarefa. Por favor, tente novamente.`);
  } finally {
    loading.value = false;
  }
};

const saveAndRunTask = async () => {
  try {
    loading.value = true;
    await saveTask();
    await tasksApi.runTask(task.id);
    await nextTick();
    await router.push(`/projects/${ props.project.id }/tasks/${ task.id }/chat`);
  } catch (error) {
    console.error('Erro ao executar tarefa:', error);
    alert('Ocorreu um erro ao executar a tarefa. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

const loadTask = async () => {
  const taskId = route.params.taskId;

  if (!taskId) return;
  if (taskId === 'new') return;

  isEditing.value = true;

  try {
    loading.value = true;
    const response = await tasksApi.getTaskById(taskId);
    const taskData = response.data;

    for (const key in taskData) {
      task[key] = taskData[key];
    }

    task.references = task.references || [];
    task.conversationId = taskData.conversationId;

    await loadConversationTitle();

  } catch (error) {
    console.error('Erro ao carregar tarefa:', error);
    alert('Não foi possível carregar os dados da tarefa.');
    await router.push(`/projects/${ props.project.id }`);
  } finally {
    loading.value = false;
  }
};

const loadConversationTitle = async () => {
  if (task.conversationId) {
    try {
      const response = await conversationsApi.getById(task.conversationId);
      conversationTitle.value = response.data.title;
    } catch (error) {
      console.error('Erro ao carregar título da conversa:', error);
    }
  }
};

const duplicateTask = async () => {
  try {
    loading.value = true;

    task.todo = []
    task.workers = []

    const duplicatedTaskData = {
      title: task.title,
      description: task.description,
      status: 'backlog',
      references: [...task.references],
      projectId: props.project.id,
      assistantId: task.assistantId
    };

    const result = await tasksApi.createTask(duplicatedTaskData);
    const duplicatedTask = result.data;

    emits('task-duplicated', duplicatedTask);
    await router.push(`/projects/${ props.project.id }/tasks/${ duplicatedTask.id }`);
    setTimeout(() => descriptionInput.value.focus(), 100);
  } catch (error) {
    console.error('Erro ao duplicar tarefa:', error);
    alert('Ocorreu um erro ao duplicar a tarefa. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

const openReferencesDialog = () => {
  referencesDialog.value.open();
};

const openFileViewDialog = (file) => {
  selectedFile.value = file;
  fileViewDialog.value.open();
};

const updateReferences = (newReferences) => {
  task.references = newReferences;
};

const removeReference = (index) => {
  task.references.splice(index, 1);
};

const loadAssistants = async () => {
  try {
    const response = await assistantsApi.listAssistants();
    assistants.value = response.data;

    // Verifica se há um assistente default no localStorage
    const defaultAssistantId = localStorage.getItem('defaultAssistantId');
    if (defaultAssistantId) {
      const assistant = assistants.value.find(assistant => assistant.id === defaultAssistantId);
      if (assistant) {
        task.assistantId = assistant.id;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar assistentes:', error);
  }
};

const taskUpdated = (updatedTask) => {
  if (updatedTask.id === task.id) {
    Object.assign(task, updatedTask);
  }
};

const handleExecute = () => {
  console.log('handleExecute');
  saveAndRunTask();
};

onMounted(async () => {
  socketIOService.socket.on('task-updated', taskUpdated);
  shortcutService.on('execute', handleExecute, 1);

  await loadTask();
  await loadAssistants();
  await descriptionInput.value.focus();
});

onUnmounted(() => {
  socketIOService.socket.off('task-updated', taskUpdated);
  shortcutService.off('execute', handleExecute);
});
</script>
