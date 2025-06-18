import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: () => import('./pages/splash/SplashPage.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('./pages/home/HomePage.vue'),
      children: [
        {
          path: '',
          name: 'projects',
          component: () => import('./pages/home/projects/ProjectsComponent.vue'),
        },
        {
          path: 'assistants',
          name: 'assistants',
          component: () => import('./pages/home/assistants/AssistantsComponent.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('./pages/home/SettingsComponent.vue'),
        }
      ]
    },
    {
      path: '/projects/:id',
      name: 'project',
      component: () => import('./pages/project/ProjectPage.vue'),
      children: [
        {
          path: '',
          name: 'tasks',
          component: () => import('./pages/project/tasks/TasksComponent.vue'),
        },
        {
          path: 'tasks/:taskId',
          name: 'task-edit',
          component: () => import('./pages/project/task/TaskComponent.vue'),
          children: [
            {
              path: '',
              name: 'task-details',
              component: () => import('./pages/project/task/TaskFormComponent.vue'),
            },
            {
              path: 'chat',
              name: 'task-chat',
              component: () => import('./pages/project/task/chat/ChatComponent.vue'),
            },
            {
              path: 'diff',
              name: 'task-diff',
              component: () => import('./pages/project/task/diff/DiffComponent.vue'),
            },
            {
              path: 'workers',
              name: 'task-agents',
              component: () => import('./pages/project/task/workers/Workers.vue'),
            },
            {
              path: 'plan',
              name: 'task-plan',
              component: () => import('./pages/project/task/PlanComponent.vue')
            },
          ]
        }
      ]
    },
  ],
})

export default router
