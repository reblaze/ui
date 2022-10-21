import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
import DocumentEditor from '@/views/DocumentEditor.vue'
import SystemDBEditor from '@/views/SystemDBEditor.vue'
import PublishChanges from '@/views/Publish.vue'
import VersionControl from '@/views/VersionControl.vue'
import DocumentList from '@/views/DocumentList.vue'
import QuarantinedList from '@/components/QuarantinedList.vue'
import RoutingProfileList from '@/views/RoutingProfileList.vue'
import RoutingProfileEditor from '@/doc-editors/RoutingProfileEditor.vue'
import MobileSDKList from '@/views/MobileSDKList.vue'
import MobileSDKEditor from '@/doc-editors/MobileSDKEditor.vue'
import ProxyTemplateList from '@/views/ProxyTemplateList.vue'
import ProxyTemplateEditor from '@/doc-editors/ProxyTemplateEditor.vue'
import WebProxyList from '@/views/WebProxyList.vue'
import WebProxyEditor from '@/doc-editors/WebProxyEditor.vue'
import BackendServiceList from '@/views/BackendServiceList.vue'
import BackendServiceEditor from '@/doc-editors/BackendServiceEditor.vue'
import HelpAndSupport from '@/views/HelpAndSupport.vue'
import DashboardDisplay from '@/views/Dashboard.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainComponent',
    component: MainComponent,
    redirect: '/dashboard',
    children: [
      {
        path: ':branch',
        name: 'MainComponent/Branch',
        redirect: '/dashboard',
        children: [
          {
            path: 'web-proxy',
            name: 'WebProxy',
            redirect: (route) => {
              return `/${route.params.branch}/web-proxy/list`
            },
            children: [
              {
                path: 'list',
                name: 'WebProxy/list',
                component: WebProxyList,
              },
              {
                path: 'config/:doc_id',
                name: 'WebProxy/config',
                component: WebProxyEditor,
              },
            ],
          },
          {
            path: 'routing-profiles',
            name: 'RoutingProfiles',
            redirect: (route) => {
              return `/${route.params.branch}/routing-profiles/list`
            },
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
            redirect: (route) => {
              return `/${route.params.branch}/mobile-sdks/list`
            },
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
            redirect: (route) => {
              return `/${route.params.branch}/proxy-templates/list`
            },
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
          {
            path: 'backend-services',
            name: 'BackendServices',
            redirect: (route) => {
              return `/${route.params.branch}/backend-services/list`
            },
            children: [
              {
                path: 'list',
                name: 'BackendServices/list',
                component: BackendServiceList,
              },
              {
                path: 'config/:doc_id',
                name: 'BackendServices/config',
                component: BackendServiceEditor,
              },
            ],
          },
          {
            path: ':doc_type',
            name: 'Document',
            redirect: (route) => {
              return `/${route.params.branch}/${route.params.doc_type}/list`
            },
            children: [
              {
                path: 'list',
                name: 'DocumentList/DocType/list',
                component: DocumentList,
              },
              {
                path: 'config/:doc_id',
                name: 'DocumentEditor/DocType/config/DocID',
                component: DocumentEditor,
              },
            ],
          },
          {path: 'version-control', name: 'VersionControl', component: VersionControl},
          {path: 'publish', name: 'PublishChanges', component: PublishChanges},
        ],
      },
      {path: 'dashboard', name: 'DashboardDisplay', component: DashboardDisplay},
      {path: 'quarantined', name: 'Quarantined', component: QuarantinedList},
      {path: 'system-db', name: 'SystemDBEditor', component: SystemDBEditor},
      {path: 'support', name: 'Support', component: HelpAndSupport},
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export {routes}

export default router
