<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Projetos</h1>
      <button @click="showProjectForm" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Novo Projeto
      </button>
    </div>
    <div class="mb-4">
      <div class="relative">
        <input type="text" v-model="searchQuery" placeholder="Pesquisar por nome, descrição ou caminho..." class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500" ref="searchRef"/>
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <ProjectComponent v-for="project in filteredProjects" :key="project.id" :project="project"/>
    </div>
    <div v-if="filteredProjects.length === 0 && searchQuery" class="text-center py-10 text-gray-400">
      Nenhum projeto encontrado para "{{ searchQuery }}"
    </div>
    <ProjectFormComponent ref="projectFormRef" @project-created="onProjectCreated"/>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { projectsApi } from '@/api/projects.api.js';
import ProjectComponent from './ProjectComponent.vue';
import ProjectFormComponent from '@/components/ProjectFormComponent.vue';

const projects = ref([]);
const searchQuery = ref('');
const projectFormRef = ref(null);
const searchRef = ref(null);

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value;
  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(project =>
      project.name.toLowerCase().includes(query) ||
      (project.path && project.path.toLowerCase().includes(query)) ||
      (project.description && project.description.toLowerCase().includes(query))
  );
});

const fetchProjects = async () => {
  try {
    const response = await projectsApi.getAllProjects();
    projects.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
  }
};

const showProjectForm = () => {
  projectFormRef.value.open();
};

const onProjectCreated = (newProject) => {
  projects.value.push(newProject);
};

onMounted(() => {
  fetchProjects();
  setTimeout(() => searchRef.value.focus(), 100);
});
</script>
