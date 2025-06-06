<template>
  <div class="flex flex-col h-full">
    <div class="flex border-b border-gray-600">
      <div v-for="(tab, index) in tabs" :key="index" class="px-3 py-1 cursor-pointer text-gray-400 border-b-2 border-transparent transition-all duration-300" :class="{ 'text-white border-blue-500': isActive(tab) }" @click="openTab(tab)">
        {{ tab.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  }
});

const activeTab = ref(null);
const router = useRouter();

const openTab = (tab) => {
  activeTab.value = tab;
  router.push({ name: tab.route, params: tab.params });
};

const isActive = (tab) => {
  return router.currentRoute.value.name === tab.route;
};

onMounted(() => {
  const routeName = router.currentRoute.value.name;
  activeTab.value = props.tabs.find(tab => tab.route === routeName);
});
</script>
