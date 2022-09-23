// @ts-nocheck
import CloudFunctionsEditor from '@/doc-editors/CloudFunctionsEditor.vue'
// import {SecurityPoliciesConnections} from '@/components/SecurityPoliciesConnections.vue'
// import ResponseAction from '@/components/ResponseAction.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {CloudFunctions, SecurityPolicy} from '@/types'
import axios from 'axios'
// import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
// import {nextTick} from 'vue'

jest.mock('axios')

describe('CloudFunctionsEditor.vue', () => {
  let securityPoliciesDocs: SecurityPolicy[]
  let cloudFunctionsDocs: CloudFunctions[]
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(() => {
    cloudFunctionsDocs = [{
      'id': 'f971e92459e2',
      'name': 'New Cloud Functions',
      'description': '5 requests per minute',
      'phase': 'requestpost',
      'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
    },
    {
      'id': 'f123456789',
      'name': 'New Cloud Function',
      'description': '2 requests per minute',
      'phase': 'responsepost',
      'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
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
            'workers': ['f971e92459e2'],
          },
          {
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'workers': ['f123456789'],
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
            'workers': ['f123456789', 'f123456789'],
          },
          {
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'workers': [],
          },
        ],
      },
    ]
    const selectedBranch = 'master'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/securitypolicies/`) {
        return Promise.resolve({data: securityPoliciesDocs})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }
    const onUpdate = async (selectedDoc: CloudFunctions) => {
      await wrapper.setProps({selectedDoc})
    }
    wrapper = mount(CloudFunctionsEditor, {
      props: {
        'selectedDoc': cloudFunctionsDocs[0],
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

  describe('form data', () => {
    afterEach(() => {
      jest.clearAllMocks()
      jest.clearAllTimers()
    })

    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(cloudFunctionsDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(cloudFunctionsDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(cloudFunctionsDocs[0].description)
    })

    test('should have correct phase in dropdown', () => {
      const element = wrapper.find('.phase-selection').element as HTMLInputElement
      expect(element.value).toEqual(cloudFunctionsDocs[0].phase)
    })

    test('should emit correct data after input was changed', async () => {
      const newDesciption = '4 new requests per minute'
      const description = wrapper.find('.document-description')
      description.value = newDesciption
      await description.setValue(newDesciption)
      await description.trigger('change')

      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0][0].description).toContain(newDesciption)
    })

    test.skip('should have a link to each connected Security Policy', async () => {
      cloudFunctionsDocs = [{
        'id': 'f971e92459e2',
        'name': 'New Cloud Functions',
        'description': '5 requests per minute',
        'phase': 'requestpost',
        'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
      },
      {
        'id': 'f123456789',
        'name': 'New Cloud Function',
        'description': '2 requests per minute',
        'phase': 'responsepost',
        'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
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
              'workers': ['f971e92459e2'],
            },
            {
              'name': 'entry name',
              'match': '/login',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': false,
              'workers': ['f123456789'],
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
              'workers': ['f123456789', 'f123456789'],
            },
            {
              'name': 'entry name',
              'match': '/login',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': false,
              'workers': [],
            },
          ],
        },
      ]
      const selectedBranch = 'master'
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === `/conf/api/v2/configs/${selectedBranch}/d/securitypolicies/`) {
          return Promise.resolve({data: securityPoliciesDocs})
        }
        return Promise.resolve({data: []})
      })
      mockRouter = {
        push: jest.fn(),
      }
      const onUpdate = async (selectedDoc: CloudFunctions) => {
        await wrapper.setProps({selectedDoc})
      }
      wrapper = mount(CloudFunctionsEditor, {
        props: {
          'selectedDoc': cloudFunctionsDocs[0],
          'selectedBranch': selectedBranch,
          'onUpdate:selectedDoc': onUpdate,
        },
        global: {
          mocks: {
            $router: mockRouter,
          },
        },
      })
      const selectedBranchStr = (wrapper.vm as VueWrapper).selectedBranch
      const wantedRoute = `/config/${selectedBranchStr}/securitypolicies/${securityPoliciesDocs[0].id}`
      // const secPolicyConnection = wrapper.findComponent(SecurityPoliciesConnections)
      // console.log('secPolicyConnection', secPolicyConnection)
      // const connectedSecurityPoliciesEntryRow = wrapper.findAll('.connected-entry-row')
      const component = wrapper.findAll('securityPoliciesConnections').at(0)
      // const referralButton = wrapper.find('.security-policy-referral-button')
      const referralButton = component.find('.add-new-connection')
      // const referralButton = wrapper.find('.new-document-button')
      await referralButton.trigger('click')
      expect(wrapper.emitted('go-to-route')).toBeTruthy()
      expect(wrapper.emitted('go-to-route')[0]).toEqual([wantedRoute])
    })
  })
})