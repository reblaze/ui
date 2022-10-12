import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
import DocumentEditor from '@/views/DocumentEditor.vue'
import CurieDBEditor from '@/views/CurieDBEditor.vue'
import PublishChanges from '@/views/Publish.vue'
import VersionControl from '@/views/VersionControl.vue'
import DocumentSearch from '@/views/DocumentSearch.vue'
import DocumentList from '@/views/DocumentList.vue'
import QuarantinedList from '@/components/QuarantinedList.vue'
import RoutingProfileList from '@/views/RoutingProfileList.vue'
import RoutingProfileEditor from '@/doc-editors/RoutingProfileEditor.vue'
import MobileSDKList from '@/views/MobileSDKList.vue'
import MobileSDKEditor from '@/doc-editors/MobileSDKEditor.vue'
import ProxyTemplateList from '@/views/ProxyTemplateList.vue'
import ProxyTemplateEditor from '@/doc-editors/ProxyTemplateEditor.vue'


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
      {path: 'quarantined', name: 'Quarantined', component: QuarantinedList},
      {path: 'CurieDB', name: 'CurieDBEditor', component: CurieDBEditor},
      {
        path: 'routing-profiles',
        name: 'RoutingProfiles',
        redirect: '/routing-profiles/list',
        children: [
          {
            path: 'list',
            name: 'RoutingProfiles/list',
            component: RoutingProfileList,
          },
          {
            path: 'config/:doc_id',
            name: 'RoutingProfiles/config',
            component: RoutingProfileEditor,
          },
        ],
      },
      {
        path: 'mobile-sdks',
        name: 'MobileSDKs',
        redirect: '/mobile-sdks/list',
        children: [
          {
            path: 'list',
            name: 'MobileSDKs/list',
            component: MobileSDKList,
          },
          {
            path: 'config/:doc_id',
            name: 'MobileSDKs/config',
            component: MobileSDKEditor,
          },
        ],
      },
      {
        path: 'proxy-templates',
        name: 'ProxyTemplates',
        redirect: '/proxy-templates/list',
        children: [
          {
            path: 'list',
            name: 'ProxyTemplates/list',
            component: ProxyTemplateList,
          },
          {
            path: 'config/:doc_id',
            name: 'ProxyTemplates/config',
            component: ProxyTemplateEditor,
          },
        ],
      },
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
