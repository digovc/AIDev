<template>
  <div class="flex items-center p-3 cursor-pointer hover:bg-gray-600 transition-colors duration-200 rounded" :class="{'bg-gray-700': isActive }" @click="$emit('select')">
    <FontAwesomeIcon :icon="icon" class="w-6 h-6"/>
    <span class="text-md hidden md:block md:ml-2">{{ label }}</span>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  icon: {
    type: Object,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>
