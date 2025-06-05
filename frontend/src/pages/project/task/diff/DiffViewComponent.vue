<template>
  <div class="w-3/4 bg-gray-900 p-4 overflow-y-auto">
    <div class="text-gray-300">
      Diff viewer for {{ file.path }}
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