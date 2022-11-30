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
import ProxyTemplateList from '@/views/ProxyTemplatesList.vue'
import ProxyTemplateEditor from '@/doc-editors/ProxyTemplatesEditor.vue'
import ServerGroupsList from '@/views/ServerGroupsList.vue'
import ServerGroupsEditor from '@/doc-editors/ServerGroupsEditor.vue'
import BackendServiceList from '@/views/BackendServicesList.vue'
import BackendServiceEditor from '@/doc-editors/BackendServicesEditor.vue'
import HelpAndSupport from '@/views/HelpAndSupport.vue'
import DashboardDisplay from '@/views/Dashboards.vue'
import DynamicRulesList from '@/views/DynamicRulesList.vue'
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import EdgeFunctionsList from '@/views/EdgeFunctionsList.vue'
import EdgeFunctionsEditor from '@/doc-editors/EdgeFunctionsEditor.vue'
import DnsPage from '@/components/DnsPage.vue'
import PremiumPage from '@/views/PremiumPage.vue'
import RequestsUtils from '@/assets/RequestsUtils'
import EventsLog from '@/views/EventsLog.vue'

async function premiumServerIsLive() {
  const url = `health/`
  const response = await RequestsUtils.sendReblazeRequest({
    methodName: 'GET',
    url,
    onFail: () => {
      console.log('Reblaze server not found, redirecting to Premium info page')
    },
  })

  const isLive = response?.status === 200
  if (!isLive) {
    return {path: '/premium'}
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainComponent',
    component: MainComponent,
    redirect: ':branch/dashboard',
    children: [
      {
        path: ':branch',
        name: 'MainComponent/Branch',
        redirect: ':branch/dashboard',
        children: [
          {
            path: 'server-groups',
            name: 'ServerGroups',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/server-groups/list`
            },
            children: [
              {
                path: 'list',
                name: 'ServerGroups/list',
                component: ServerGroupsList,
                meta: {
                  title: 'Server Groups List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'ServerGroups/config',
                component: ServerGroupsEditor,
                meta: {
                  title: 'Server Groups Editor',
                },
              },
            ],
          },
          {
            path: 'routing-profiles',
            name: 'RoutingProfiles',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/routing-profiles/list`
            },
            children: [
              {
                path: 'list',
                name: 'RoutingProfiles/list',
                component: RoutingProfileList,
                meta: {
                  title: 'Routing Profiles List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'RoutingProfiles/config',
                component: RoutingProfileEditor,
                meta: {
                  title: 'Routing Profiles Editor',
                },
              },
            ],
          },
          {
            path: 'mobile-sdks',
            name: 'MobileSDK',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/mobile-sdks/list`
            },
            children: [
              {
                path: 'list',
                name: 'MobileSDK/list',
                component: MobileSDKList,
                meta: {
                  title: 'Mobile SDK List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'MobileSDK/config',
                component: MobileSDKEditor,
                meta: {
                  title: 'Mobile SDK Editor',
                },
              },
            ],
          },
          {
            path: 'proxy-templates',
            name: 'ProxyTemplates',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/proxy-templates/list`
            },
            children: [
              {
                path: 'list',
                name: 'ProxyTemplates/list',
                component: ProxyTemplateList,
                meta: {
                  title: 'Proxy Templates List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'ProxyTemplates/config',
                component: ProxyTemplateEditor,
                meta: {
                  title: 'Proxy Templates Editor',
                },
              },
            ],
          },
          {
            path: 'dynamic-rules',
            name: 'DynamicRules',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/dynamic-rules/list`
            },
            children: [
              {
                path: 'list',
                name: 'DynamicRules/list',
                component: DynamicRulesList,
                meta: {
                  title: 'Dynamic Rules List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'DynamicRules/config',
                component: DynamicRulesEditor,
                meta: {
                  title: 'Dynamic Rules Editor',
                },
              },
            ],
          },
          {
            path: 'backend-services',
            name: 'BackendServices',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/backend-services/list`
            },
            children: [
              {
                path: 'list',
                name: 'BackendServices/list',
                component: BackendServiceList,
                meta: {
                  title: 'Backend Services List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'BackendServices/config',
                component: BackendServiceEditor,
                meta: {
                  title: 'Backend Services Editor',
                },
              },
            ],
          },
          {
            path: 'cloud-functions',
            name: 'EdgeFunctions',
            beforeEnter: [premiumServerIsLive],
            redirect: (route) => {
              return `/${route.params.branch}/cloud-functions/list`
            },
            children: [
              {
                path: 'list',
                name: 'EdgeFunctions/list',
                component: EdgeFunctionsList,
                meta: {
                  title: 'Edge Functions List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'EdgeFunctions/config',
                component: EdgeFunctionsEditor,
                meta: {
                  title: 'Edge Functions Editor',
                },
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
                meta: {
                  title: ':docType: List',
                },
              },
              {
                path: 'config/:doc_id',
                name: 'DocumentEditor/DocType/config/DocID',
                component: DocumentEditor,
                meta: {
                  title: ':docType: Editor',
                },
              },
            ],
          },
          {
            path: 'version-control',
            name: 'VersionControl',
            component: VersionControl,
            meta: {
              title: 'Version Control',
            },
          },
          {
            path: 'publish',
            name: 'PublishChanges',
            component: PublishChanges,
            meta: {
              title: 'Publish Changes',
            },
          },
        ],
      },
      {
        path: ':branch/dashboard',
        name: 'DashboardDisplay',
        component: DashboardDisplay,
        meta: {
          title: 'Dashboard',
        },
      },
      {
        path: '/:branch/events-log',
        name: 'EventsLog',
        component: EventsLog,
        meta: {
          title: 'Events Log',
        },
      },
      {
        path: 'premium',
        name: 'Premium',
        component: PremiumPage,
        meta: {
          title: 'Premium',
        },
      },
      {
        path: ':branch/dns-records',
        name: 'DNSRecords',
        component: DnsPage,
        meta: {
          title: 'DNS Records',
        },
      },
      {
        path: '/:branch/quarantined',
        name: 'Quarantined',
        component: QuarantinedList,
        meta: {
          title: 'Quarantined',
        },
      },
      {
        path: '/:branch/system-db',
        name: 'SystemDBEditor',
        component: SystemDBEditor,
        meta: {
          title: 'System DB',
        },
      },
      {
        path: '/:branch/support',
        name: 'Support',
        component: HelpAndSupport,
        meta: {
          title: 'Help And Support',
        },
      },
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
