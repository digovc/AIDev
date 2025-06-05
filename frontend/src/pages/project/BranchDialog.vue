<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900 text-white">
    <div class="p-6 w-full h-full flex flex-col space-y-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Selecionar Branch</h2>
        <button @click="close" class="text-white">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <!-- Lista de branches -->
      <div class="grow">
        <div v-if="branches.length === 0" class="text-sm text-gray-400 text-center py-4 h-full flex items-center justify-center">
          Nenhuma branch encontrada
        </div>

        <div v-else class="grid gap-3">
          <div v-for="(branch, index) in branches" :key="index" class="p-1 cursor-pointer hover:bg-gray-700 text-sm">
            <div>{{ branch }}</div>
          </div>
        </div>
      </div>

      <!-- Botão Checkout -->
      <button @click="checkoutBranch" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        Checkout
      </button>
    </div>
  </dialog>
</template>

<script setup>
import { ref } from 'vue';

const dialogRef = ref(null);
const branches = ref([]);

const open = () => {
  dialogRef.value.showModal();
};

const close = () => {
  dialogRef.value.close();
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
