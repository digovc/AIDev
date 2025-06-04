<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-header"
        :class="{ 'active': activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </div>
    </div>
    <div class="tabs-content">
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

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #4b5563;
}

.tab-header {
  padding: 10px 20px;
  cursor: pointer;
  color: #9ca3af;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-header.active {
  color: #f3f4f6;
  border-bottom: 2px solid #3b82f6;
}

.tabs-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px 0;
}
</style>