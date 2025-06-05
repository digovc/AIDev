<template>
  <div class="flex h-full">
    <div class="w-32 md:w-64 border-r border-gray-200 p-4 overflow-y-auto">
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">Menu</h2>
        <div class="space-y-2">
          <MenuItemComponent :icon="ProjectsIcon" label="Projetos" :is-active="currentRoute === 'projects'" @select="navigateTo('projects')"/>
          <MenuItemComponent :icon="AssistantsIcon" label="Assistentes" :is-active="currentRoute === 'assistants'" @select="navigateTo('assistants')"/>
          <MenuItemComponent :icon="SettingsIcon" label="Configurações" :is-active="currentRoute === 'settings'" @select="navigateTo('settings')"/>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <component :is="Component"/>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MenuItemComponent from './MenuItemComponent.vue'
import { faCog, faFolderOpen, faUsers } from '@fortawesome/free-solid-svg-icons'

const ProjectsIcon = faFolderOpen
const AssistantsIcon = faUsers
const SettingsIcon = faCog

const router = useRouter()
const currentRoute = ref('projects')

function navigateTo(route) {
  currentRoute.value = route
  switch (route) {
    case 'projects':
      router.push({ name: 'projects' })
      break
    case 'assistants':
      router.push({ name: 'assistants' })
      break
    case 'settings':
      router.push({ name: 'settings' })
      break
  }
}
</script>
