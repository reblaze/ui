import {createRouter, createWebHistory} from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
import DocumentEditor from '@/views/DocumentEditor.vue'
import CurieDBEditor from '@/views/CurieDBEditor.vue'
import PublishChanges from '@/views/Publish.vue'
import VersionControl from '@/views/VersionControl.vue'
import DocumentSearch from '@/views/DocumentSearch.vue'
import DocumentList from '@/views/DocumentList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainComponent',
    component: MainComponent,
    redirect: '/config',
    children: [
      {
        path: 'config',
        name: 'DocumentEditor',
        component: DocumentEditor,
        children: [
          {
            path: ':branch',
            name: 'DocumentEditor/Branch',
            component: DocumentEditor,
            children: [
              {
                path: ':doc_type',
                name: 'DocumentEditor/Branch/DocType',
                component: DocumentEditor,
                children: [
                  {
                    path: ':doc_id',
                    name: 'DocumentEditor/Branch/DocType/DocID',
                    component: DocumentEditor,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'list',
        name: 'DocumentList',
        component: DocumentList,
        children: [
          {
            path: ':branch',
            name: 'DocumentList/Branch',
            component: DocumentList,
            children: [
              {
                path: ':doc_type',
                name: 'DocumentList/Branch/DocType',
                component: DocumentList,
              },
            ],
          },
        ],
      },
      {path: 'CurieDB', name: 'CurieDBEditor', component: CurieDBEditor},
      {path: 'publish', name: 'PublishChanges', component: PublishChanges},
      {path: 'versioncontrol', name: 'VersionControl', component: VersionControl},
      {path: 'search', name: 'DocumentSearch', component: DocumentSearch},
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/config',
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export { routes }

export default router
