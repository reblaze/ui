// @ts-nocheck
import SideMenu from '@/components/SideMenu.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, mount} from '@vue/test-utils'
import axios from 'axios'
import {Branch} from '../../types'
import {setImmediate} from 'timers'
import {nextTick} from 'vue'

jest.mock('axios')

// TODO: Needs a complete re-write. Resolve pinia integration with jest and remove this skip
describe.skip('SideMenu.vue', () => {
  let wrapper: any
  let $route: any
  let gitData: Branch[]
  let swaggerURL: string
  let kibanaURL: string
  let grafanaURL: string
  let prometheusURL: string
  let dbData: any
  beforeEach(() => {
    gitData = [
      {
        'id': 'prod',
        'description': 'Update entry [__acldefault__] of document [aclprofiles]',
        'date': '2020-11-10T15:49:17+02:00',
        'logs': [
          {
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
      },
      {
        'id': 'zzz_branch',
        'description': 'Initial empty content',
        'date': '2020-08-27T16:19:06+00:00',
        'logs': [
          {
            'version': 'a34f979217215060861b58b3f270e82580c20efb',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': 'a34f979217215060861b58b3f270e82580c20efb',
      },
    ]
    $route = {
      path: '/list',
    }
    swaggerURL = 'https://10.0.0.1:30000/api/v3/'
    kibanaURL = 'https://10.0.0.1:5601/app/discover/'
    grafanaURL = 'https://10.0.0.1:30300/'
    prometheusURL = 'https://10.0.0.1:9090/'
    dbData = {
      links: {
        swagger_url: swaggerURL,
        kibana_url: kibanaURL,
        grafana_url: grafanaURL,
        prometheus_url: prometheusURL,
      },
    }
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve({data: dbData})
      }
      if (path === '/conf/api/v3/configs/') {
        return Promise.resolve({data: gitData})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
    })
  })

  test('should render all menu labels', () => {
    const wantedMenuLabels = ['analytics', 'settings', 'git', 'help']

    const actualMenuLabels = wrapper.findAll('.menu-label')
    for (let i = 0; i < wantedMenuLabels.length; i++) {
      expect(actualMenuLabels.at(i).text()).toEqual(wantedMenuLabels[i])
    }
  })

  function menuItemShouldContainWantedSectionItems(menuItemName: string, wantedSectionItems: any[]) {
    const menuItem = wrapper.findAll('.menu-item').filter((item: any) => item.text()?.includes(menuItemName))
    const sectionItems = menuItem.at(0).findAll('.section-item')
    wantedSectionItems.forEach((wantedSectionItem) => {
      const match: DOMWrapper<any> = sectionItems.find((sectionItem: DOMWrapper<any>) => {
        return sectionItem.text().includes(wantedSectionItem.title)
      })
      expect(match).toBeDefined()
      expect(match.text()).toContain(wantedSectionItem.title)
      if (wantedSectionItem.external) {
        expect(match.html()).toContain(`href="${wantedSectionItem.path}"`)
      } else {
        expect(match.html()).toContain(`to="${wantedSectionItem.path}"`)
      }
    })
  }

  test('should render all static Settings menu items when system db does not exist', () => {
    const wantedInternalMenuItems = [
      {path: '/list', title: 'Policies & Rules'},
      {path: '/CurieDB', title: 'CurieDB'},
      {path: '/publish', title: 'Publish Changes'},
    ]

    menuItemShouldContainWantedSectionItems('settings', wantedInternalMenuItems)
  })

  test('should render all static Git menu items', () => {
    const wantedMenuItems = [
      {path: '/versioncontrol', title: 'Version Control'},
    ]

    menuItemShouldContainWantedSectionItems('git', wantedMenuItems)
  })

  test('should render support page', () => {
    const wantedMenuItems = [
      {path: '/support', title: 'Support'},
    ]

    menuItemShouldContainWantedSectionItems('help', wantedMenuItems)
  })

  test('should render all static Docs menu items', () => {
    const wantedMenuItems = [
      {path: 'https://docs.curiefense.io/', title: 'Curiebook', external: true},
    ]

    menuItemShouldContainWantedSectionItems('help', wantedMenuItems)
  })

  test('should render all dynamic menu items when system db exists with links and URLs data', (done) => {
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve({data: dbData})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
    })
    const wantedDocsMenuItems = [
      {
        path: swaggerURL,
        title: 'API',
        external: true,
      },
    ]
    const wantedAnalyticsMenuItems = [
      {
        path: kibanaURL,
        title: 'Kibana',
        external: true,
      },
      {
        path: grafanaURL,
        title: 'Grafana',
        external: true,
      },
      {
        path: prometheusURL,
        title: 'Prometheus',
        external: true,
      },
    ]
    // allow all requests to finish
    setImmediate(() => {
      menuItemShouldContainWantedSectionItems('help', wantedDocsMenuItems)
      menuItemShouldContainWantedSectionItems('analytics', wantedAnalyticsMenuItems)
      done()
    })
  })

  test('should render all dynamic menu items when system db exists without URLs in links data', (done) => {
    delete dbData.links.grafana_url
    delete dbData.links.kibana_url
    delete dbData.links.prometheus_url
    delete dbData.links.swagger_url
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve({data: dbData})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
    })
    const wantedDocsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:30000/api/v3/`,
        title: 'API',
        external: true,
      },
    ]
    const wantedAnalyticsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:5601/app/discover`,
        title: 'Kibana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:30300/`,
        title: 'Grafana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:9090/`,
        title: 'Prometheus',
        external: true,
      },
    ]
    // allow all requests to finish
    setImmediate(() => {
      menuItemShouldContainWantedSectionItems('help', wantedDocsMenuItems)
      menuItemShouldContainWantedSectionItems('analytics', wantedAnalyticsMenuItems)
      done()
    })
  })

  test('should render all dynamic menu items when system db exists without links data', (done) => {
    delete dbData.links
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve({data: dbData})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
    })
    const wantedDocsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:30000/api/v3/`,
        title: 'API',
        external: true,
      },
    ]
    const wantedAnalyticsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:5601/app/discover`,
        title: 'Kibana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:30300/`,
        title: 'Grafana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:9090/`,
        title: 'Prometheus',
        external: true,
      },
    ]
    // allow all requests to finish
    setImmediate(() => {
      menuItemShouldContainWantedSectionItems('help', wantedDocsMenuItems)
      menuItemShouldContainWantedSectionItems('analytics', wantedAnalyticsMenuItems)
      done()
    })
  })

  test('should render all dynamic menu items when system db does not exist', (done) => {
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve({data: {}})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(SideMenu, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
    })
    const wantedDocsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:30000/api/v3/`,
        title: 'API',
        external: true,
      },
    ]
    const wantedAnalyticsMenuItems = [
      {
        path: `${location.protocol}//${location.hostname}:5601/app/discover`,
        title: 'Kibana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:30300/`,
        title: 'Grafana',
        external: true,
      },
      {
        path: `${location.protocol}//${location.hostname}:9090/`,
        title: 'Prometheus',
        external: true,
      },
    ]
    // allow all requests to finish
    setImmediate(() => {
      menuItemShouldContainWantedSectionItems('help', wantedDocsMenuItems)
      menuItemShouldContainWantedSectionItems('analytics', wantedAnalyticsMenuItems)
      done()
    })
  })

  test('should take defaultUrl when API call failed', async () => {
    dbData = {
      links: {
        swagger_url: 'Aylon',
        kibana_url: kibanaURL,
        grafana_url: grafanaURL,
        prometheus_url: prometheusURL,
      },
    }
    jest.clearAllMocks()
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/db/system/`) {
        return Promise.resolve(null)
      }
      if (path === '/conf/api/v3/configs/') {
        return Promise.resolve({data: gitData})
      }
      return Promise.resolve({data: {}})
    })
    const wrapper = mount(SideMenu)
    await wrapper.setData({defaultSwaggerURL: 'Aviv'})
    wrapper.vm.$forceUpdate()
    await nextTick()
    await nextTick()
    await nextTick()
    await nextTick()
    expect(wrapper.vm.menuItems.help.swagger.url).toEqual(wrapper.vm.defaultSwaggerURL)
  })
})
