<template>
  <div @click="$emit('edit-assistant', assistant)" class="bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105">
    <h2 class="text-xl font-semibold mb-2">{{ assistant.name }}</h2>
    <p class="text-sm text-gray-400 mb-2 line-clamp-3">{{ assistant.profile }}</p>
    <div class="text-sm text-gray-300 text-xs">
      <span class="mr-2">Provider:</span> {{ assistant.provider }} <span class="ml-2">Modelo:</span> {{
        assistant.model
      }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  assistant: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit-assistant']);
</script>
