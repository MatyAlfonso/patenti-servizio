import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/richieste'
    },
    {
      path: '/richieste',
      name: 'Richieste',
      component: () => import('@/pages/RichiestePage.vue')
    },
    {
      path: '/anagrafica_personale',
      name: 'Anagrafica del personale',
      component: () => import('@/pages/AnagraficaPersonalePage.vue')
    },
    {
      path: '/anagrafica_enti',
      name: 'Anagrafica degli enti',
      component: () => import('@/pages/AnagraficaEntiPage.vue')
    },
    {
      path: '/patenti',
      name: 'Patenti civili e di servizio',
      component: () => import('@/pages/PatentiPage.vue')
    },
  ]
})

export default router
