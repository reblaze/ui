import {createRouter, createWebHistory} from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
import DocumentEditor from '@/views/DocumentEditor.vue'
import CurieDBEditor from '@/views/CurieDBEditor.vue'
import PublishChanges from '@/views/Publish.vue'
import VersionControl from '@/views/VersionControl.vue'
import WebProxy from '@/views/WebProxy.vue'
import RoutingProfileList from '@/views/RoutingProfileList.vue'
import MobileSDK from '@/views/MobileSDK.vue'
import ProxyTemplate from '@/views/ProxyTemplate.vue'
import DocumentSearch from '@/views/DocumentSearch.vue'
import DocumentList from '@/views/DocumentList.vue'
import RoutingProfileEditor from '@/doc-editors/RoutingProfileEditor.vue'
import MobileSDKEditor from '@/doc-editors/MobileSDKEditor.vue'

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
      {path: 'WebProxy', name: 'WebProxy', component: WebProxy},
      {
        path: '/routing-profile/list',
        name: 'RoutingProfile/list',
        component: RoutingProfileList,
      },
      {
        path: '/routing-profile/config/:doc_id',
        name: 'RoutingProfile/config',
        component: RoutingProfileEditor,
      },
      {
        path: '/mobilesdk/list',
        name: 'MobileSDK/list',
        component: MobileSDK,
      },
      {
        path: '/mobilesdk/config/:doc_id',
        name: 'MobileSDK/config',
        component: MobileSDKEditor,
      },
      {path: 'ProxyTemplate', name: 'ProxyTemplate', component: ProxyTemplate},
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

export {routes}

export default router
