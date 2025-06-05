<template>
  <div class="bg-gray-900 rounded-lg shadow-md py-1 px-2">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <h1 class="text-lg font-bold">{{ project?.name }}</h1>
        <div class="text-gray-300 text-xs">
          {{ project?.path }}
        </div>
        <button @click="editProject" class="text-gray-400 hover:text-gray-200 text-sm">
          <FontAwesomeIcon :icon="faEdit"/>
        </button>
        <button @click="openBranchDialog" class="text-gray-400 hover:text-gray-200 text-sm">
          <FontAwesomeIcon :icon="faCodeBranch"/>
        </button>
      </div>
      <button @click="backToHome" class="text-gray-400 hover:text-gray-200">
        <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
      </button>
    </div>
    <ProjectFormComponent ref="projectFormRef" @project-updated="onProjectUpdated"/>
    <BranchDialog ref="branchDialogRef" :project="project"/>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import ProjectFormComponent from '@/components/ProjectFormComponent.vue';
import BranchDialog from './BranchDialog.vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCodeBranch, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";

const router = useRouter();
const projectFormRef = ref(null);
const branchDialogRef = ref(null);

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

const openBranchDialog = () => {
  branchDialogRef.value.open();
};

const onProjectUpdated = (updatedProject) => {
  emit('project-updated', updatedProject);
};
</script>
