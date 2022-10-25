// @ts-nocheck
import RateLimitsEditor from '../RateLimitRulesEditor.vue'
import LimitOption from '@/components/LimitOption.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, shallowMount, VueWrapper} from '@vue/test-utils'
import {CustomResponse, RateLimit, SecurityPolicy} from '@/types'
import axios from 'axios'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {nextTick} from 'vue'

jest.mock('axios')

describe('RateLimitRulesEditor.vue', () => {
  let rateLimitsDocs: RateLimit[]
  let securityPoliciesDocs: SecurityPolicy[]
  let customResponsesDocs: CustomResponse[]
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
          'action': 'action-rate-limit-block',
        },
      ],
      'timeframe': '60',
      'include': ['blocklist'],
      'exclude': ['allowlist'],
      'key': [{'attrs': 'securitypolicyid'}, {'attrs': 'securitypolicyentryid'}, {'attrs': 'session'}],
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
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
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
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
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
    customResponsesDocs = [
      {
        'id': 'action-rate-limit-block',
        'name': 'default monitoring action',
      },
    ]
    const selectedBranch = 'prod'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/securitypolicies/`) {
        return Promise.resolve({data: securityPoliciesDocs})
      }
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/actions/`) {
        return Promise.resolve({data: customResponsesDocs})
      }
      if (path === `/conf/api/v3/configs/${selectedBranch}/ratelimits/f971e92459e2`) {
        return Promise.resolve({data: rateLimitsDocs[0]})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }
    const onUpdate = async (selectedDoc: RateLimit) => {
      await wrapper.setProps({selectedDoc})
    }
    wrapper = shallowMount(RateLimitsEditor, {
      props: {
        'selectedDoc': rateLimitsDocs[0],
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
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(rateLimitsDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(rateLimitsDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(rateLimitsDocs[0].description)
    })

    test('should have correct threshold in input', () => {
      const element = wrapper.find('.document-limit').element as HTMLInputElement
      expect(element.value).toEqual(rateLimitsDocs[0].thresholds[0].limit)
    })

    test('should have correct Time Frame in input', () => {
      const element = wrapper.find('.document-timeframe').element as HTMLInputElement
      expect(element.value).toEqual(rateLimitsDocs[0].timeframe)
    })

    test('should have count-by limit option component with correct data', () => {
      const wantedType = Object.keys(rateLimitsDocs[0].key[0])[0]
      const wantedValue = Object.values(rateLimitsDocs[0].key[0])[0]
      const limitOptionComponent = wrapper.findComponent(LimitOption)
      const actualType = limitOptionComponent.vm.option.type
      const actualValue = limitOptionComponent.vm.option.key
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have event limit option component with correct data', () => {
      const wantedType = Object.keys(rateLimitsDocs[0].pairwith)[0]
      const wantedValue = Object.values(rateLimitsDocs[0].pairwith)[0]
      const actualType = wrapper.vm.eventOption.type
      const actualValue = wrapper.vm.eventOption.key
      expect(actualValue).toEqual(wantedValue)
      expect(actualType).toEqual(wantedType)
    })

    test('should have limit option keys with correct data', () => {
      const wantedType = Object.keys(rateLimitsDocs[0].key[0])[0]
      const wantedValue = Object.values(rateLimitsDocs[0].key[0])[0]
      const limitOptionComponent = wrapper.findComponent(LimitOption)
      const actualType = limitOptionComponent.vm.option.type
      const actualValue = limitOptionComponent.vm.option.key
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have count-by limit option component with correct ignored attributes', () => {
      const wantedIgnoredAttributes = ['tags']
      const limitOptionComponent = wrapper.findComponent(LimitOption)
      const actualIgnoredAttributes = limitOptionComponent.vm.ignoreAttributes
      expect(wantedIgnoredAttributes).toEqual(actualIgnoredAttributes)
    })

    test('should have event limit option component with correct ignored attributes', () => {
      const wantedIgnoredAttributes = ['tags']
      const limitOptionComponent = wrapper.findComponent(LimitOption)
      const actualIgnoredAttributes = limitOptionComponent.vm.ignoreAttributes
      expect(wantedIgnoredAttributes).toEqual(actualIgnoredAttributes)
    })

    test('should have response action selection with correct data', () => {
      const wantedCustomResponse = rateLimitsDocs[0].thresholds[0].action.toString()
      const thresholdActionSelection = wrapper.find('.threshold-action-selection')
      const selectedCustomResponseElement = thresholdActionSelection.find('option:checked').element
      const selectedCustomResponse = (selectedCustomResponseElement as HTMLOptionElement).value
      expect(selectedCustomResponse).toEqual(wantedCustomResponse)
    })

    test('should have correct include data in table', () => {
      const includeTags = wrapper.find('.include-filter-column')
      const includeTagsCell0 = includeTags.find('.tag-cell')
      const wantedIncludeTags = rateLimitsDocs[0].include.toString()
      expect(includeTagsCell0.text()).toEqual(wantedIncludeTags)
    })

    test('should have correct exclude data in table', () => {
      const excludeTags = wrapper.find('.exclude-filter-column')
      const includeTagsCell0 = excludeTags.find('.tag-cell')
      const wantedExcludeTags = rateLimitsDocs[0].exclude.toString()
      expect(includeTagsCell0.text()).toEqual(wantedExcludeTags)
    })
  })

  describe('count by key', () => {
    test('should add key when button is clicked', async () => {
      const addKeyButton = wrapper.find('.add-key-button')
      await addKeyButton.trigger('click')
      const wantedType = 'attrs'
      const wantedValue = 'securitypolicyentryid'
      const actualType = Object.keys(wrapper.vm.localDoc.key[1])[0]
      const actualValue = Object.values(wrapper.vm.localDoc.key[1])[0]
      expect(wrapper.vm.localDoc.key.length).toEqual(4)
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(wantedValue)
    })

    test('should handle key with no value', async () => {
      rateLimitsDocs[0].key = [{'headers': null}]
      wrapper = shallowMount(RateLimitsEditor, {
        props: {
          selectedDoc: rateLimitsDocs[0],
        },
      })
      const wantedType = 'headers'
      const actualType = Object.keys(wrapper.vm.localDoc.key[0])[0]
      const actualValue = Object.values(wrapper.vm.localDoc.key[0])[0]
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(null)
    })

    test('should show error when two of the same key type exist', async () => {
      const addKeyButton = wrapper.find('.add-key-button')
      await addKeyButton.trigger('click')
      await addKeyButton.trigger('click')
      const keyInvalidLabel = wrapper.find('.key-invalid')
      expect(keyInvalidLabel.exists()).toBeTruthy()
    })

    test('should remove key when remove event occurs', async () => {
      expect(wrapper.vm.localDoc.key.length).toEqual(3) // default has 3 atributes keys
      const addKeyButton = wrapper.find('.add-key-button')
      await addKeyButton.trigger('click')
      expect(wrapper.vm.localDoc.key.length).toEqual(4) // plus 1 = 4
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      limitOptionsComponent.vm.$emit('remove', 1)
      expect(wrapper.vm.localDoc.key.length).toEqual(3) // minus 1 = 3
    })

    test('should not be able to remove key when only one key exists', () => {
      expect(wrapper.vm.localDoc.key.length).toEqual(3) // default has 3 atributes keys
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      limitOptionsComponent.vm.$emit('remove', 1)
      limitOptionsComponent.vm.$emit('remove', 1)
      expect(wrapper.vm.localDoc.key.length).toEqual(1) // remove 2 remain 1
      limitOptionsComponent.vm.$emit('remove', 1)
      expect(wrapper.vm.localDoc.key.length).toEqual(1) // trying to remove 1 more failes, cannot be 0
    })

    test('should update key when change event occurs', async () => {
      const newOption = {
        type: 'self',
        key: 'self',
      }
      const wantedResult = {
        self: 'self',
      }
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      limitOptionsComponent.vm.$emit('change', newOption, 0)
      expect(wrapper.vm.localDoc.key[0]).toEqual(wantedResult)
    })

    test('should handle selectedDoc with undefined key value', async () => {
      try {
        rateLimitsDocs[0].key = [{'headers': null}, undefined]
        wrapper = shallowMount(RateLimitsEditor, {
          props: {
            selectedDoc: rateLimitsDocs[0],
          },
        })
        // zawait nextTick()
      } catch (err) {
        // should not get here
        expect(err).not.toBeDefined()
      }
    })
  })

  describe('thresholds', () => {
    test('should add threshold when button is clicked', async () => {
      const addThresholdButton = wrapper.find('.add-threshold-button')
      await addThresholdButton.trigger('click')
      const wantedLimit = 0
      const wantedCustomResponse = 'action-rate-limit-block'
      const actualLimit = wrapper.vm.localDoc.thresholds[1].limit
      const actualCustomResponse = wrapper.vm.localDoc.thresholds[1].action
      expect(wrapper.vm.localDoc.thresholds.length).toEqual(2)
      expect(actualLimit).toEqual(wantedLimit)
      expect(actualCustomResponse).toEqual(wantedCustomResponse)
    })

    test('should remove threshold when remove event occurs', async () => {
      expect(wrapper.vm.localDoc.thresholds.length).toEqual(1)
      const addThresholdButton = wrapper.find('.add-threshold-button')
      await addThresholdButton.trigger('click')
      expect(wrapper.vm.localDoc.thresholds.length).toEqual(2)
      const removeThresholdButton = wrapper.find('.remove-threshold-option-button')
      await removeThresholdButton.trigger('click')
      expect(wrapper.vm.localDoc.thresholds.length).toEqual(1)
    })

    test('should not be able to remove threshold when only one key exists', async () => {
      const removeThresholdButton = wrapper.find('.remove-threshold-option-button')
      await removeThresholdButton.trigger('click')
      expect(wrapper.vm.localDoc.thresholds.length).toEqual(1)
    })
  })

  describe('event', () => {
    test('should handle key with no value', async () => {
      rateLimitsDocs[0].pairwith = {'self': null}
      wrapper = shallowMount(RateLimitsEditor, {
        props: {
          selectedDoc: rateLimitsDocs[0],
        },
      })
      const wantedType = 'self'
      const actualType = Object.keys(wrapper.vm.localDoc.pairwith)[0]
      const actualValue = Object.values(wrapper.vm.localDoc.pairwith)[0]
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(null)
    })

    test('should update key when change event occurs', async () => {
      const newOption = {
        type: 'self',
        key: 'self',
      }
      const wantedResult = {
        self: 'self',
      }
      const limitOptionsComponent = wrapper.findAllComponents(LimitOption).at(1)
      limitOptionsComponent.vm.$emit('change', newOption, 0)
      expect(wrapper.vm.localDoc.pairwith).toEqual(wantedResult)
    })

    test('should handle selectedDoc without pairwith property', async () => {
      try {
        delete rateLimitsDocs[0].pairwith
        wrapper = shallowMount(RateLimitsEditor, {
          props: {
            selectedDoc: rateLimitsDocs[0],
          },
        })
        // await nextTick()
      } catch (err) {
        // Should not get here
        expect(err).not.toBeDefined()
      }
    })
  })

  describe('tags', () => {
    let filterColumn
    beforeEach(() => {
      const tagsData = {
        data: {
          tags: [
            'united-states',
            'test-tag-1',
            'test-tag-2',
            'another-tag',
            'devops',
            'internal',
          ],
        },
      }
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === `db/prod/k/autocomplete/`) {
          return Promise.resolve(tagsData)
        }
        return Promise.resolve()
      })
      filterColumn = wrapper.find('.filter-column')
    })

    test('should not have any warning in the tags table when there are no duplicate tags', () => {
      const tagsWithWarning = filterColumn.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(0)
    })

    test('should emit doc update when adding tags', async () => {
      const newTag = 'test-tag'
      const wantedEmit = JSON.parse(JSON.stringify(rateLimitsDocs[0]))
      wantedEmit.include.push(newTag)
      const newIncludeEntryButton = filterColumn.findAll('.add-new-filter-entry-button').at(0)
      // add first
      await newIncludeEntryButton.trigger('click')
      const includeTagAutocompleteInput = filterColumn.findComponent(TagAutocompleteInput)
      includeTagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0][0].include).toEqual(wantedEmit.include)
    })

    test('should show a warning when there are duplicate tags', async () => {
      const duplicatedTagsDoc = JSON.parse(JSON.stringify(rateLimitsDocs[0]))
      duplicatedTagsDoc.include = ['test-tag', 'test-tag']
      await wrapper.setProps({selectedDoc: duplicatedTagsDoc})
      // check
      const tagsWithWarning = filterColumn.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(2)
    })

    test('should not emit doc update when adding tags which is 2 or less characters long', async () => {
      const newTag = 't'
      const wantedEmit = JSON.parse(JSON.stringify(rateLimitsDocs[0]))
      wantedEmit.include.push(newTag)
      const newIncludeEntryButton = filterColumn.findAll('.add-new-filter-entry-button').at(0)
      // add first
      await newIncludeEntryButton.trigger('click')
      const firstTagAutocompleteInput = filterColumn.findComponent(TagAutocompleteInput)
      firstTagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeFalsy()
    })

    test('should remove tag from correct filter when tag removed', async () => {
      const wantedSize = wrapper.vm.localDoc.include.length - 1
      const removeIncludeEntryButton = filterColumn.findAll('.remove-filter-entry-button').at(0)
      await removeIncludeEntryButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(wrapper.vm.localDoc.include.length).toEqual(wantedSize)
    })

    test('should hide tag input when tag selection cancelled', async () => {
      const newIncludeEntryButton = filterColumn.find('.add-new-filter-entry-button')
      await newIncludeEntryButton.trigger('click')
      wrapper.vm.cancelAddNewTag()
      const tagAutocompleteInput = filterColumn.findComponent(TagAutocompleteInput)
      await nextTick()
      expect(tagAutocompleteInput.exists()).toBeFalsy()
    })
  })

  describe('connected Security Policies', () => {
    beforeEach(() => {
      const selectedBranch = 'prod'
      const onUpdate = async (selectedDoc: RateLimit) => {
        await wrapper.setProps({selectedDoc})
      }
      wrapper = mount(RateLimitsEditor, {
        props: {
          'selectedDoc': rateLimitsDocs[0],
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
      const wantedRoute = `/${selectedBranchStr}/securitypolicies/config/${securityPoliciesDocs[0].id}`
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
              'acl_profile': '__acldefault__',
              'acl_active': false,
              'content_filter_profile': '__defaultcontentfilter__',
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
              'acl_profile': '__acldefault__',
              'acl_active': false,
              'content_filter_profile': '__defaultcontentfilter__',
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
      wrapper = mount(RateLimitsEditor, {
        props: {
          selectedDoc: rateLimitsDocs[0],
          selectedBranch: 'prod',
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
