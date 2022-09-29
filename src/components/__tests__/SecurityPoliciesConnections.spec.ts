// @ts-nocheck
import SecurityPoliciesConnections from '@/components/SecurityPoliciesConnections.vue'
import axios from 'axios'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {RateLimit, SecurityPolicy} from '@/types'
// import {nextTick} from 'vue'CloudFunctions


jest.mock('axios')

describe('SecurityPoliciesConnections.vue', () => {
  let rateLimitsDocs: RateLimit[]
  let securityPoliciesDocs: SecurityPolicy[]
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(() => {
    rateLimitsDocs = [{
      'id': 'f971e92459e2',
      'name': 'Rate Limit Example Rule 5/60',
      'description': '5 requests per minute',
      'thresholds': [
        {
          'limit': '5',
          'action': {'type': 'default'},
        },
      ],
      'timeframe': '60',
      'include': ['blocklist'],
      'exclude': ['allowlist'],
      'key': [{'attrs': 'ip'}],
      'pairwith': {'self': 'self'},
    }]
    securityPoliciesDocs = [
      {
        'id': '__default__',
        'name': 'default entry',
        'match': '__default__',
        'map': [
          {
            'name': 'default',
            'match': '/',
            'acl_profile': '__default__',
            'acl_active': false,
            'content_filter_profile': '__default__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2'],
          },
          {
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'limit_ids': ['365757ec0689'],
          },
        ],
      },
      {
        'id': '3086b9c5b518',
        'name': 'copy of default entry',
        'match': 'www.example.com',
        'map': [
          {
            'name': 'default',
            'match': '/',
            'acl_profile': '__default__',
            'acl_active': false,
            'content_filter_profile': '__default__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2', '365757ec0689'],
          },
          {
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'limit_ids': [],
          },
        ],
      },
    ]
    const selectedBranch = 'master'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/securitypolicies/`) {
        return Promise.resolve({data: securityPoliciesDocs})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }

    const onUpdate = async (selectedDocId: RateLimit) => {
      await wrapper.setProps({selectedDocId})
    }

    wrapper = mount(SecurityPoliciesConnections, {
      props: {
        'selectedDocId': 'f971e92459e2',
        'selectedDocType': 'ratelimits',
        'selectedBranch': selectedBranch,
        'onUpdate:selectedDoc': onUpdate,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    })
  })

  describe('connected Security Policies', () => {
    afterEach(() => {
      jest.clearAllMocks()
      jest.clearAllTimers()
    })

    test('should display all connected Security Policies', () => {
      const connectedSecurityPoliciesEntriesRows = wrapper.findAll('.connected-entry-row')
      expect(connectedSecurityPoliciesEntriesRows.length).toEqual(2)
    })

    test('should have a link to each connected Security Policy', async () => {
      const selectedBranchStr = (wrapper.vm as VueWrapper).selectedBranch
      const wantedRoute = `/config/${selectedBranchStr}/securitypolicies/${securityPoliciesDocs[0].id}`
      const connectedSecurityPoliciesEntryRow = wrapper.findAll('.connected-entry-row').at(0)
      const referralButton = connectedSecurityPoliciesEntryRow.find('.security-policy-referral-button')
      await referralButton.trigger('click')
      expect(wrapper.emitted('go-to-route')).toBeTruthy()
      expect(wrapper.emitted('go-to-route')[0]).toEqual([wantedRoute])
    })

    test('should show the new connection row when `+` button is clicked', async () => {
      const newConnectionButton = wrapper.find('.new-connection-button')
      await newConnectionButton.trigger('click')
      const newConnectionRow = wrapper.find('.new-connection-row')
      expect(newConnectionRow.exists()).toBeTruthy()
    })

    test('should show an appropriate message when there are no available new connections', async () => {
      const wantedMessage = `All Security Policies entries are currently connected to this entity`
      securityPoliciesDocs = [
        {
          'id': '__default__',
          'name': 'default entry',
          'match': '__default__',
          'map': [
            {
              'name': 'default',
              'match': '/',
              'acl_profile': '__default__',
              'acl_active': false,
              'content_filter_profile': '__default__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2', '365757ec0689'],
            },
            {
              'name': 'entry name',
              'match': '/login',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2', '365757ec0689'],
            },
          ],
        },
        {
          'id': '3086b9c5b518',
          'name': 'copy of default entry',
          'match': 'www.example.com',
          'map': [
            {
              'name': 'default',
              'match': '/',
              'acl_profile': '__default__',
              'acl_active': false,
              'content_filter_profile': '__default__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2', '365757ec0689'],
            },
            {
              'name': 'entry name',
              'match': '/login',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2', '365757ec0689'],
            },
          ],
        },
      ]
      const selectedBranch = 'master'
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === `/conf/api/v3/configs/${selectedBranch}/d/securitypolicies/`) {
          return Promise.resolve({data: securityPoliciesDocs})
        }
        return Promise.resolve({data: []})
      })
      wrapper = mount(SecurityPoliciesConnections, {
        props: {
          selectedDocId: 'f971e92459e2',
          selectedDocType: 'ratelimits',
          selectedBranch: 'master',
        },
      })
      const newConnectionButton = wrapper.find('.new-connection-button')
      await newConnectionButton.trigger('click')
      const newConnectionRow = wrapper.find('.new-connection-row')
      expect(newConnectionRow.text()).toEqual(wantedMessage)
    })

    test('should show an appropriate message when there are no available new connections for cloudFunctionsEditor page',
      async () => {
        const wantedMessage = `All Security Policies entries are currently connected to this entity`
        securityPoliciesDocs = [
          {
            'id': '__default__',
            'name': 'default entry',
            'match': '__default__',
            'map': [
              {
                'name': 'default',
                'match': '/',
                'acl_profile': '__default__',
                'acl_active': false,
                'content_filter_profile': '__default__',
                'content_filter_active': false,
                'workers': ['f123456789', 'f971e92459e2'],
              },
              {
                'name': 'entry name',
                'match': '/login',
                'acl_profile': '5828321c37e0',
                'acl_active': false,
                'content_filter_profile': '009e846e819e',
                'content_filter_active': false,
                'workers': ['f971e92459e2', 'f123456789'],
              },
            ],
          },
        ]
        const selectedBranch = 'master'
        jest.spyOn(axios, 'get').mockImplementation((path) => {
          if (path === `/conf/api/v3/configs/${selectedBranch}/d/securitypolicies/`) {
            return Promise.resolve({data: securityPoliciesDocs})
          }
          return Promise.resolve({data: []})
        })
        wrapper = mount(SecurityPoliciesConnections, {
          props: {
            selectedDocId: 'f123456789',
            selectedDocType: 'cloudfunctions',
            selectedBranch: 'master',
          },
        })
        const newConnectionButton = wrapper.find('.new-connection-button')
        await newConnectionButton.trigger('click')
        const newConnectionRow = wrapper.find('.new-connection-row')
        expect(newConnectionRow.text()).toEqual(wantedMessage)
      })

    test('should hide the new connection row when `-` button is clicked', async () => {
      let newConnectionButton = wrapper.find('.new-connection-button')
      await newConnectionButton.trigger('click')
      newConnectionButton = wrapper.find('.new-connection-button')
      await newConnectionButton.trigger('click')
      const newConnectionRow = wrapper.find('.new-connection-row')
      expect(newConnectionRow.exists()).toBeFalsy()
    })

    test('should send request to change Security Policy when new connection is added', async () => {
      const putSpy = jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      const selectedBranch = wrapper.vm.selectedBranch
      const wantedUrl = `/conf/api/v3/configs/${selectedBranch}/d/securitypolicies/e/${securityPoliciesDocs[1].id}/`
      const wantedDoc = JSON.parse(JSON.stringify(securityPoliciesDocs[1]))
      wantedDoc.map[1].limit_ids.push(rateLimitsDocs[0].id)
      const newConnectionButton = wrapper.find('.new-connection-button')
      await newConnectionButton.trigger('click')
      const newConnectionRow = wrapper.find('.new-connection-row')
      const newConnectionMapSelection = newConnectionRow.find('.new-connection-map')
      const options = newConnectionMapSelection.findAll('option')
      newConnectionMapSelection.setValue(options.at(1).element.value)
      const addNewConnectionButton = wrapper.find('.add-new-connection')
      await addNewConnectionButton.trigger('click')
      wrapper.vm.$forceUpdate()
      expect(putSpy).toHaveBeenCalledWith(wantedUrl, wantedDoc)
    })

    test('should send request to change Security Policy when removing connection was confirmed', async () => {
      const putSpy = jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      // eslint-disable-next-line max-len
      const wantedUrl = `/conf/api/v3/configs/${wrapper.vm.selectedBranch}/d/securitypolicies/e/${securityPoliciesDocs[0].id}/`
      const wantedDoc = JSON.parse(JSON.stringify(securityPoliciesDocs[0]))
      wantedDoc.map[0].limit_ids = []
      const removeConnectionButton = wrapper.findAll('.remove-connection-button').at(0)
      await removeConnectionButton.trigger('click')
      const confirmRemoveConnectionButton = wrapper.find('.confirm-remove-connection-button')
      await confirmRemoveConnectionButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(wantedUrl, wantedDoc)
    })

    test('should not send request to change Security Policy when removing connection was cancelled', async () => {
      const putSpy = jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      const removeConnectionButton = wrapper.findAll('.remove-connection-button').at(0)
      await removeConnectionButton.trigger('click')
      const cancelRemoveConnectionButton = wrapper.find('.cancel-remove-connection-button')
      await cancelRemoveConnectionButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })
  })
})
