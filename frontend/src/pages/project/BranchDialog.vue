<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900 text-white" @click="handleClick">
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

        <div v-else>
          <select v-model="selectedBranch" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
            <option v-for="(branch, index) in branches" :key="index" :value="branch">
              {{ branch }}
            </option>
          </select>
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
import { computed, ref } from 'vue';
import { gitApi } from "@/api/git.api.js";
import { useRoute } from "vue-router";

const dialogRef = ref(null);
const branches = ref([]);
const selectedBranch = ref(null);
const route = useRoute();

const taskId = computed(() => route.params.taskId);

const checkoutBranch = async () => {
  const isConfirmed = confirm(`Deseja realmente fazer checkout da branch ${ selectedBranch.value }?`);
  if (isConfirmed) {
    await gitApi.checkout(selectedBranch.value);
    close();
  }
};

const open = async () => {
  const response = await gitApi.getRemoteBranches(taskId.value);

  branches.value = response.data;

  if (branches.value.length > 0) {
    selectedBranch.value = branches.value[0];
  }

  dialogRef.value.showModal();
};

const close = () => {
  dialogRef.value.close();
};

const handleClick = (event) => {
  if (event.target === dialogRef.value) {
    close();
  }
}

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
  width: 25vw;
  height: 25vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
