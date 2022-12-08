// @ts-nocheck
import SideMenu from '@/components/SideMenu.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import _ = require('lodash')
import {useBranchesStore} from '../../stores/BranchesStore'
import packageJson from '../../../package.json'

jest.mock('../../assets/RequestsUtils.ts')
const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
    doc_id: 'f971e92459e2',
  },
  path: `/${selectedBranch}/cloud-functions/config/f971e92459e2`,
  name: 'EdgeFunctions/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))

describe('SideMenu.vue', () => {
  let wrapper: any
  let swaggerURL: string
  // let kibanaURL: string
  let grafanaURL: string
  // let prometheusURL: string
  let mockRouter: any
  let dbData: any
  beforeEach(async () => {
    swaggerURL = 'https://10.0.0.1:30000/api/v3/'
    // kibanaURL = 'https://10.0.0.1:5601/app/discover/'
    grafanaURL = 'https://10.0.0.1:30300/'
    // prometheusURL = 'https://10.0.0.1:9090/'
    dbData = {
      links: {
        swagger_url: swaggerURL,
        // kibana_url: kibanaURL,
        grafana_url: grafanaURL,
        // prometheus_url: prometheusURL,
      },
    }
    jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `db/system/`) {
          return Promise.resolve({data: dbData})
        }
        return Promise.resolve({data: {}})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          '$route': mockRoute,
          '$router': mockRouter,
        },
        plugins: [createTestingPinia()],
        stubs: ['router-link', 'router-view', 'sidebar-menu'],
      },
    })
    const store = useBranchesStore()
    store.selectedBranch = {
      id: selectedBranch,
    }
    await nextTick()
  })

  test('should render sidebar-menu component', () => {
    const component = wrapper.findComponent({name: 'SidebarMenu'})
    expect(component.exists()).toBeTruthy()
  })

  test('should have all menu headers', () => {
    const wantedMenuHeaders = ['analytics', 'security', 'premium security', 'saas settings', 'system', 'help']

    const menu = wrapper.vm.menu
    const actualMenuHeaders = _.filter(_.map(menu, (menuItem) => {
      return menuItem.header?.toLowerCase() || ''
    }), (headerName) => {
      return headerName
    })
    _.forEach(wantedMenuHeaders, (wantedMenuHeader) => {
      expect(actualMenuHeaders).toContain(wantedMenuHeader)
    })
  })

  function menuItemShouldContainWantedSectionItems(menuHeader: string, wantedSectionItems: any[]) {
    const menu = wrapper.vm.menu
    let actualSectionItems = _.cloneDeep(menu)
    const menuHeaderIndex = menu.findIndex((menuItem) => {
      return menuItem.header?.toLowerCase() === menuHeader
    })
    actualSectionItems = actualSectionItems.slice(menuHeaderIndex + 1)
    const nextMenuHeaderIndex = actualSectionItems.findIndex((menuItem) => {
      return menuItem.header
    })
    if (nextMenuHeaderIndex > -1) {
      actualSectionItems = actualSectionItems.slice(0, nextMenuHeaderIndex)
    }
    wantedSectionItems.forEach((wantedSectionItem, index) => {
      expect(actualSectionItems[index]?.href).toEqual(wantedSectionItem.path)
      expect(actualSectionItems[index]?.title).toEqual(wantedSectionItem.title)
      if (wantedSectionItem.external) {
        expect(actualSectionItems[index]?.external).toEqual(wantedSectionItem.external)
      }
    })
  }

  test('should render all `Analytics` menu items - external paths from DB', () => {
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/dashboard`, title: 'Dashboard'},
      {path: grafanaURL, title: 'Grafana', external: true},
      {path: `/${selectedBranch}/events-log`, title: 'Events Log'},
    ]

    menuItemShouldContainWantedSectionItems('analytics', wantedInternalMenuItems)
  })

  test('should render all `Security` menu items', () => {
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/globalfilters`, title: 'Global Filters'},
      {path: `/${selectedBranch}/flowcontrol`, title: 'Flow Control Policies'},
      {path: `/${selectedBranch}/securitypolicies`, title: 'Security Policies'},
      {path: `/${selectedBranch}/ratelimits`, title: 'Rate Limit Rules'},
      {path: `/${selectedBranch}/aclprofiles`, title: 'ACL Profiles'},
      {path: `/${selectedBranch}/contentfilterprofiles`, title: 'Content Filter Profiles'},
      {path: `/${selectedBranch}/contentfilterrules`, title: 'Content Filter Rules'},
      {path: `/${selectedBranch}/actions`, title: 'Custom Responses'},
    ]

    menuItemShouldContainWantedSectionItems('security', wantedInternalMenuItems)
  })

  test('should render all `Premium Security` menu items', () => {
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/dynamic-rules`, title: 'Dynamic Rules'},
      {path: `/${selectedBranch}/quarantined`, title: 'Quarantined'},
      {path: `/${selectedBranch}/mobile-sdks`, title: 'Mobile SDK'},
    ]

    menuItemShouldContainWantedSectionItems('premium security', wantedInternalMenuItems)
  })

  test('should render all `SaaS Settings` menu items', () => {
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/server-groups`, title: 'Server Groups'},
      {path: `/${selectedBranch}/backend-services`, title: 'Backend Services'},
      {path: `/${selectedBranch}/routing-profiles`, title: 'Routing Profiles'},
      {path: `/${selectedBranch}/proxy-templates`, title: 'Proxy Templates'},
      {path: `/${selectedBranch}/cloud-functions`, title: 'Edge Functions'},
      {path: `/${selectedBranch}/ssl`, title: 'SSL'},
      {path: `/${selectedBranch}/dns-records`, title: 'DNS Records'},
    ]

    menuItemShouldContainWantedSectionItems('saas settings', wantedInternalMenuItems)
  })

  test('should render all `System` menu items', () => {
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/version-control`, title: 'Version Control'},
      {path: `/${selectedBranch}/system-db`, title: 'System DB'},
      {path: `/${selectedBranch}/publish`, title: 'Publish Changes'},
    ]

    menuItemShouldContainWantedSectionItems('system', wantedInternalMenuItems)
  })

  test('should render all `Help` menu items - external paths from DB', () => {
    const splitVersion = packageJson.version.split('.')
    const docsVersion = `${splitVersion[0]}.${splitVersion[1]}`
    const wantedInternalMenuItems = [
      {path: `/${selectedBranch}/support`, title: 'Support'},
      {path: 'https://docs.curiefense.io/', title: 'Curiebook', external: true},
      {path: `https://gb.docs.reblaze.com/v/v${docsVersion}`, title: 'Reblazebook', external: true},
      {path: 'https://10.0.0.1:30000/api/v3/', title: 'API', external: true},
    ]

    menuItemShouldContainWantedSectionItems('help', wantedInternalMenuItems)
  })

  test('should render default external paths for menu items if failed to load from DB', async () => {
    dbData = {}
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          '$route': mockRoute,
          '$router': mockRouter,
        },
        plugins: [createTestingPinia()],
        stubs: ['router-link', 'router-view', 'sidebar-menu'],
      },
    })
    await nextTick()
    const menu = wrapper.vm.menu
    const grafanaSwaggerItem = _.find(menu, (menuItem) => {
      return menuItem.title === 'Grafana'
    })
    expect(grafanaSwaggerItem.href).toEqual('http://localhost:30300/')
    const swaggerMenuItem = _.find(menu, (menuItem) => {
      return menuItem.title === 'API'
    })
    expect(swaggerMenuItem.href).toEqual('http://localhost:30000/api/v3/')
  })
})
