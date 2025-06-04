<template>
  <div class="flex flex-col h-full">
    <div class="flex border-b border-gray-600">
      <div v-for="(tab, index) in tabs" :key="index" class="px-5 py-2.5 cursor-pointer text-gray-400 border-b-2 border-transparent transition-all duration-300" :class="{ 'text-gray-100 border-blue-500': activeTab === index }" @click="activeTab = index">
        {{ tab.title }}
      </div>
    </div>
    <div class="flex-1 overflow-y-auto py-[15px]">
      <slot :name="`tab-${activeTab}`"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref(0);
const tabs = ref([
  { title: 'Detalhes' },
  { title: 'Histórico' },
  // Add more tabs as needed
]);
</script>
