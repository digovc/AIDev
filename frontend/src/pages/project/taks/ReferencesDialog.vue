<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900 text-white">
    <div class="p-6 w-full h-full flex flex-col space-y-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Referências</h2>
        <button @click="close" class="text-white">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Campo de pesquisa -->
      <div class="mb-4 relative">
        <input type="text" v-model="searchQuery" @keydown="handleKeyDown" placeholder="Pesquisar referências..." class="form-input w-full" autofocus/>

        <!-- Resultados da pesquisa -->
        <div v-if="searchResults.length > 0" ref="searchResultsRef" class="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div v-for="(result, idx) in searchResults" :key="idx" @click="handleKeyDown($event)" :class="['p-1 cursor-pointer hover:bg-gray-700 text-sm', selectedIndex === idx ? 'bg-gray-700' : '']">
            <div>{{ result.name }}</div>
            <div class="text-xs text-gray-200 truncate">{{ result.path }}</div>
          </div>
        </div>

        <div v-if="isSearching" class="mt-2 text-sm text-gray-300">
          Buscando...
        </div>
      </div>

      <!-- Lista de referências adicionadas -->
      <div class="grow">
        <div v-if="references.length === 0" class="text-gray-400 text-center py-4 h-full flex items-center justify-center">
          Nenhuma referência adicionada
        </div>

        <div v-else class="grid gap-3">
          <ReferenceComponent v-for="(ref, index) in references" :key="index" :reference="ref" @remove="removeReference(index)"/>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { referencesApi } from '@/api/references.api';
import ReferenceComponent from '@/components/ReferenceComponent.vue';
import { debounce } from 'lodash'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  taskReferences: {
    type: Array,
    default: () => []
  }
});

const dialogRef = ref(null);
const emit = defineEmits(['update:references']);
const isSearching = ref(false);
const loading = ref(false);
const references = ref([...props.taskReferences]);
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndex = ref(-1);
const searchResultsRef = ref(null);

watch(searchQuery, () => {
  selectedIndex.value = -1;
  searchReferences();
});

const open = () => {
  references.value = [...props.taskReferences];
  dialogRef.value.showModal();

};

const close = () => {
  dialogRef.value.close();
  resetForm();

};

const resetForm = () => {
  searchQuery.value = '';
  searchResults.value = [];
  selectedIndex.value = -1;

};

const removeReference = (index) => {
  references.value.splice(index, 1);

};

// Método removido, pois a atualização de referências agora acontece em tempo real

const searchReferences = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const response = await referencesApi.search(props.project.id, searchQuery.value);
    // Filtra referências que ainda não foram adicionadas
    searchResults.value = (response.data || []).filter(
        result => !references.value.some(ref => ref.path === result.path)
    );
    selectedIndex.value = searchResults.value.length > 0 ? 0 : -1;
  } catch (error) {
    console.error('Erro ao buscar referências:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}, 500);

const scrollToSelectedItem = () => {
  if (searchResultsRef.value && selectedIndex.value !== -1) {
    const selectedElement = searchResultsRef.value.querySelector(`:nth-child(${ selectedIndex.value + 1 })`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    close();
    return;
  }

  if (searchResults.value.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % searchResults.value.length;
    nextTick(scrollToSelectedItem);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = selectedIndex.value <= 0 ? searchResults.value.length - 1 : selectedIndex.value - 1;
    nextTick(scrollToSelectedItem);
  } else if ((e.key === 'Enter' || e.type === 'click') && selectedIndex.value >= 0) {
    e.preventDefault();
    addSelectedReference();
    // Não limpa a pesquisa, permitindo adicionar mais referências
  }
};

const addSelectedReference = () => {
  if (selectedIndex.value >= 0 && searchResults.value[selectedIndex.value]) {
    const selected = searchResults.value[selectedIndex.value];
    references.value.push({
      name: selected.name,
      path: selected.path
    });

    // Removemos apenas a referência selecionada da lista de resultados
    searchResults.value = searchResults.value.filter(result => result.path !== selected.path);

    // Atualizamos a seleção para o primeiro item se ainda houver resultados
    selectedIndex.value = searchResults.value.length > 0 ? 0 : -1;

    // Não limpamos o query para permitir adicionar mais referências
    // da mesma pesquisa, mas emitimos a atualização
    emit('update:references', references.value);
  }
};

defineExpose({
  open
});
</script>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  border: none;
  width: 75vw;
  height: 75vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
