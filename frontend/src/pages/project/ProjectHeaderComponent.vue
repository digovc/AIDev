<template>
  <div class="bg-gray-900 rounded-lg shadow-md py-1 px-4">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h1 class="text-lg font-bold">{{ project?.name }}</h1>
        <div class="text-gray-300 text-xs">
          {{ project?.path }}
        </div>
        <button @click="editProject" class="text-gray-400 hover:text-gray-200 text-sm">
          <FontAwesomeIcon :icon="faEdit"/>
        </button>
      </div>
      <button @click="backToHome" class="text-gray-400 hover:text-gray-200">
        <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
      </button>
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
