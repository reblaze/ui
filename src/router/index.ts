import {createRouter, createWebHistory} from 'vue-router'
import {RouteRecordRaw} from 'vue-router'

// Vue.use(VueRouter)
// Vue.use(VueAxios, axios)

// #DEPRECATED: remove /db redirect on version 1.6.0, because this just a legacy for API v1 in 1.5.0.
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MasterComponent',
    component: () => import('@/views/MasterComponent.vue'),
    redirect: '/config',
    children: [
      {
        path: 'config',
        name: 'DocumentEditor',
        component: () => import('@/views/DocumentList.vue'), //TODO: need to change to DocumentList.vue instead DocumentEditor.vue
        children: [
          {
            path: ':branch',
            name: 'DocumentEditor/Branch',
            component: () => import('@/views/DocumentList.vue'), //TODO: need to change to DocumentList.vue instead DocumentEditor.vue
            children: [
              {
                path: ':doc_type',
                name: 'DocumentEditor/Branch/DocType',
                component: () => import('@/views/DocumentList.vue'), //TODO: need to change to DocumentList.vue instead DocumentEditor.vue
                children: [
                  {
                    path: ':doc_id',
                    name: 'DocumentEditor/Branch/DocType/DocID',
                    component: () => import('@/views/DocumentEditor.vue'),
                  },
                ],
              },
            ],
          },
        ],
      },
      {path: 'db', name: 'MasterComponent', redirect: '/CurieDB'},
      {path: 'CurieDB', name: 'CurieDBEditor', component: () => import('../views/CurieDBEditor.vue')},
      {path: 'publish', name: 'PublishChanges', component: () => import('../views/Publish.vue')},
      {path: 'versioncontrol', name: 'VersionControl', component: () => import('../views/VersionControl.vue')},
      {path: 'search', name: 'DocumentSearch', component: () => import('@/views/DocumentSearch.vue')},
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/config',
  },
]

const router = createRouter({
  history: createWebHistory(),
  // base: process.env.BASE_URL,
  routes,
})


export default router
