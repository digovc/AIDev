<template>
  <div class="group bg-gray-800 rounded-lg shadow-md p-1 px-4 flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-700" @click="$emit('click')">
    <div class="text-xs text-gray-300">
      {{ file.path }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  file: {
    type: Object,
    required: true
  }
});
</script>
