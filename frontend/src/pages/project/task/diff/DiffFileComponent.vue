<template>
  <div class="group bg-gray-800 rounded-lg p-2 flex justify-between items-center mb-2 gap-2 cursor-pointer hover:bg-gray-700" @click="$emit('click')">
    <div class="text-xs text-gray-300">
      {{ file.path }}
    </div>
    <div class="flex items-center">
      <div class="text-xs font-mono pr-2" :class="statusClass">
        {{ statusText }}
      </div>
      <div @click.stop="rollbackFile" class="text-gray-400 hover:text-white" title="'Rollback'">
        <FontAwesomeIcon :icon="faUndo"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
  file: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['rollback']);

const rollbackFile = () => {
  if (confirm(`Tem certeza que deseja reverter as alterações no arquivo ${ props.file.path }?`)) {
    emit('rollback', props.file);
  }
};

const statusClass = computed(() => {
  switch (props.file.status) {
    case 'M':
      return 'text-yellow-500';
    case 'AM':
      return 'text-green-500';
    default:
      return 'text-gray-400';
  }
});

const statusText = computed(() => {
  switch (props.file.status) {
    case 'M':
      return 'Mod';
    case 'AM':
      return 'Add';
    default:
      return 'Não modificado';
  }
});
</script>
