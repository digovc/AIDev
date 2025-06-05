<template>
  <div class="overflow-hidden bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-102" @click="navigateToProject">
    <h2 class="text-xl font-semibold mb-2">{{ project.name }}</h2>
    <p v-if="project.description" class="text-sm text-gray-400 mb-2 line-clamp-2">{{ project.description }}</p>
    <div class="text-sm text-gray-300 text-xs">
      <span>Path:</span> {{ project.path }}
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const navigateToProject = (event) => {
  if (event.metaKey || event.ctrlKey) {
    const baseUrl = window.location.origin + window.location.pathname;
    const projectUrl = `${ baseUrl }#/projects/${ props.project.id }`;

    window.open(projectUrl, '_blank');
  } else {
    router.push(`/projects/${ props.project.id }`);
  }
};
</script>
