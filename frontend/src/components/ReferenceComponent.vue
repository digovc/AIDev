<template>
  <div class="group bg-gray-800 rounded-lg shadow-md p-1 px-4 flex justify-between items-center">
    <div class="text-xs text-gray-300">
      {{ reference.path }}
    </div>
    <div class="flex gap-2">
      <button @click.stop="$emit('view')" class="invisible text-blue-500 hover:text-blue-700 group-hover:visible">
        <FontAwesomeIcon :icon="faEye"/>
      </button>
      <button @click.stop="$emit('remove')" class="invisible text-red-500 hover:text-red-700 group-hover:visible">
        <FontAwesomeIcon :icon="faTimes"/>
      </button>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faTimes } from "@fortawesome/free-solid-svg-icons";

defineProps({
  reference: {
    type: Object,
    required: true
  }
});

defineEmits(['remove', 'view']);
</script>
