<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold mb-1">{{ project?.name }}</h1>
        <div class="text-gray-300 text-xs">
          Path: {{ project?.path }}
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <button @click="editProject" class="text-gray-400 hover:text-gray-200">
          <FontAwesomeIcon :icon="faEdit"/>
        </button>
        <button @click="backToHome" class="text-gray-400 hover:text-gray-200">
          <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
        </button>
      </div>
    </div>
    <ProjectFormComponent ref="projectFormRef" @project-updated="onProjectUpdated"/>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import ProjectFormComponent from '@/components/ProjectFormComponent.vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";

const router = useRouter();
const projectFormRef = ref(null);

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['project-updated']);

const backToHome = () => {
  router.push('/home');
};

const editProject = () => {
  projectFormRef.value.open(props.project);
};

const onProjectUpdated = (updatedProject) => {
  emit('project-updated', updatedProject);
};
</script>
