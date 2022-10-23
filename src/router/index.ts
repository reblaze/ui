import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import MainComponent from '@/views/MainComponent.vue'
import DocumentEditor from '@/views/DocumentEditor.vue'
import SystemDBEditor from '@/views/SystemDBEditor.vue'
import PublishChanges from '@/views/Publish.vue'
import VersionControl from '@/views/VersionControl.vue'
import DocumentList from '@/views/DocumentList.vue'
import QuarantinedList from '@/components/QuarantinedList.vue'
import RoutingProfileList from '@/views/RoutingProfilesList.vue'
import RoutingProfileEditor from '@/doc-editors/RoutingProfilesEditor.vue'
import MobileSDKList from '@/views/MobileSDKsList.vue'
import MobileSDKEditor from '@/doc-editors/MobileSDKsEditor.vue'
import ConfigTemplateList from '@/views/ConfigTemplatesList.vue'
import ConfigTemplateEditor from '@/doc-editors/ConfigTemplatesEditor.vue'
import ServerGroupsList from '@/views/ServerGroupsList.vue'
import ServerGroupsEditor from '@/doc-editors/ServerGroupsEditor.vue'
import BackendServiceList from '@/views/BackendServicesList.vue'
import BackendServiceEditor from '@/doc-editors/BackendServicesEditor.vue'
import HelpAndSupport from '@/views/HelpAndSupport.vue'
import DashboardDisplay from '@/views/Dashboards.vue'

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
            path: 'server-groups',
            name: 'ServerGroups',
            redirect: (route) => {
              return `/${route.params.branch}/server-groups/list`
            },
            children: [
              {
                path: 'list',
                name: 'ServerGroups/list',
                component: ServerGroupsList,
              },
              {
                path: 'config/:doc_id',
                name: 'ServerGroups/config',
                component: ServerGroupsEditor,
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
            path: 'config-templates',
            name: 'ConfigTemplates',
            redirect: (route) => {
              return `/${route.params.branch}/config-templates/list`
            },
            children: [
              {
                path: 'list',
                name: 'ConfigTemplates/list',
                component: ConfigTemplateList,
              },
              {
                path: 'config/:doc_id',
                name: 'ConfigTemplates/config',
                component: ConfigTemplateEditor,
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
