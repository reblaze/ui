import {createRouter, createWebHistory} from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
// import DocumentEditor from '@/views/DocumentEditor.vue'
// import CurieDBEditor from '@/views/CurieDBEditor.vue'
// import PublishChanges from '@/views/Publish.vue'
// import VersionControl from '@/views/VersionControl.vue'
import DocumentSearch from '@/views/DocumentSearch.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainComponent',
    component: MainComponent,
    redirect: '/config',
    children: [
      {
        path: 'config',
        name: 'DocumentList',
        component: () => import('@/views/DocumentList.vue'),
        children: [
          {
            path: ':branch',
            name: 'DocumentList/Branch',
            component: () => import('@/views/DocumentList.vue'),
            children: [
              {
                path: ':doc_type',
                name: 'DocumentList/Branch/DocType',
                component: () => import('@/views/DocumentList.vue'),
                children: [
                  {
                    path: ':doc_id',
                    name: 'DocumentEditor/Branch/DocType/DocID',
                    component: () => import('@/views/DocumentEditor.vue'),
                  },
                ],
              },
              {
                path: 'list',
                name: 'DocumentList',
                component: DocumentSearch,
                children: [
                  {
                    path: ':branch',
                    name: 'DocumentList/Branch',
                    component: DocumentSearch,
                    children: [
                      {
                        path: ':doc_type',
                        name: 'DocumentList/Branch/DocType',
                        component: DocumentSearch,
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
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})


export default router
