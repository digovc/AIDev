<template>
  <div class="group bg-gray-800 rounded-lg p-2 flex mb-2 gap-4 cursor-pointer hover:bg-gray-700">
    <div class="text-xs text-gray-300 grow truncate text-left" dir="rtl">
      {{ file.path }}
    </div>
    <div class="flex items-center gap-4">
      <div class="text-xs font-mono" :class="statusClass">
        {{ statusText }}
      </div>
      <div v-if="file.status === 'M'" @click.stop="rollbackFile" class="text-gray-400 hover:text-white" title="'Rollback'">
        <FontAwesomeIcon :icon="faUndo"/>
      </div>
      <div v-if="file.status === 'A'" @click.stop="deleteFile" class="text-gray-400 hover:text-white" title="'Rollback'">
        <FontAwesomeIcon :icon="faTrash"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";
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
    return false;
  }
};

const deleteFile = () => {
  if (confirm(`Tem certeza que deseja excluir o arquivo ${ props.file.path }?`)) {
    emit('delete', props.file);
    return false;
  }
};

const statusClass = computed(() => {
  switch (props.file.status) {
    case 'D':
      return 'text-red-500';
    case 'R':
      return 'text-orange-500';
    case 'M':
      return 'text-yellow-500';
    case 'A':
      return 'text-green-500';
    default:
      return 'text-gray-400';
  }
});

const statusText = computed(() => {
  switch (props.file.status) {
    case 'D':
      return 'Del';
    case 'R':
      return 'Ren';
    case 'M':
    case 'AM':
      return 'Mod';
    case 'A':
      return 'Add';
    default:
      return 'Não modificado';
  }
});
</script>
