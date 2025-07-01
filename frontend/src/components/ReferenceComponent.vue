<template>
  <div class="group bg-gray-800 rounded-lg p-1 px-4 flex items-center gap-4">
    <div @click.stop="copyToClipboard" class="text-xs text-gray-300 cursor-pointer grow truncate" dir="rtl" title="Copy to clipboard">
      {{ reference.path }}
    </div>
    <div class="flex gap-4">
      <button @click.stop="$emit('view')" class="text-blue-500 hover:text-blue-700 group-hover:visible" title="View file">
        <FontAwesomeIcon :icon="faEye"/>
      </button>
      <button @click.stop="$emit('remove')" class="text-red-500 hover:text-red-700 group-hover:visible" title="Remove reference">
        <FontAwesomeIcon :icon="faTimes"/>
      </button>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faTimes } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  reference: {
    type: Object,
    required: true
  }
});

defineEmits(['remove', 'view']);

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.reference.path);
};
</script>
