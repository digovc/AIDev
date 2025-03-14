<template>
  <div class="group bg-gray-800 rounded-lg shadow-md p-2  px-4 hover:shadow-lg transition-shadow duration-300 flex justify-between items-center">
    <div>
      <h3 class="font-semibold mb-1">{{ reference.name }}</h3>
      <div class="text-xs text-gray-300">
        {{ reference.path }}
      </div>
    </div>
    <button @click.stop="$emit('remove')" class="text-red-500 invisible hover:text-red-700 group-hover:visible">
      <span class="text-xl">&times;</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  reference: {
    type: Object,
    required: true
  }
});

defineEmits(['remove']);
</script>
