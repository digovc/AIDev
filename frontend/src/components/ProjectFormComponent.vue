<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900">
    <div class="p-6 w-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">{{ isEditing ? 'Editar Projeto' : 'Novo Projeto' }}</h2>
        <button @click="close" class="text-white">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <form @submit.prevent="saveProject">
        <div class="mb-4">
          <label for="name" class="form-label">Nome</label>
          <input type="text" id="name" v-model="project.name" class="form-input" required autofocus/>
        </div>

        <div class="mb-4">
          <label for="description" class="form-label">Descrição</label>
          <textarea id="description" v-model="project.description" rows="15" class="form-input"></textarea>
        </div>

        <div class="mb-6">
          <label for="path" class="form-label">Caminho</label>
          <input type="text" id="path" v-model="project.path" class="form-input" required/>
        </div>

        <div class="flex justify-end space-x-3">
          <button type="button" @click="close" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { projectsApi } from '@/api/projects.api';

const props = defineProps({
  projectData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['project-created', 'project-updated']);
const dialogRef = ref(null);
const loading = ref(false);

const project = reactive({
  id: '',
  name: '',
  description: '',
  path: '',
  conversations: [],
  tasks: []
});

const isEditing = computed(() => !!project.id);

const open = (projectToEdit = null) => {
  if (projectToEdit) {
    Object.assign(project, projectToEdit);
  } else {
    resetForm();
  }
  dialogRef.value.showModal();
};

const close = () => {
  dialogRef.value.close();
  resetForm();
};

const resetForm = () => {
  project.id = '';
  project.name = '';
  project.description = '';
  project.path = '';
  project.conversations = [];
  project.tasks = [];
};

const saveProject = async () => {
  try {
    loading.value = true;
    let response;
    
    if (isEditing.value) {
      response = await projectsApi.updateProject(project.id, project);
      emit('project-updated', response.data);
    } else {
      response = await projectsApi.createProject(project);
      emit('project-created', response.data);
    }
    
    close();
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    alert('Ocorreu um erro ao salvar o projeto. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

defineExpose({
  open
});
</script>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  border: none;
  width: 75vw;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
