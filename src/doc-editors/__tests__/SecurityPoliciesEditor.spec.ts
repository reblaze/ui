// @ts-nocheck
import {shallowMount, VueWrapper} from '@vue/test-utils'
import SecurityPoliciesEditor from '@/doc-editors/SecurityPoliciesEditor.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {ACLProfile, ContentFilterProfile, RateLimit, SecurityPolicy} from '@/types'
import _ from 'lodash'
import {setImmediate} from 'timers'
import {nextTick} from 'vue'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
    doc_type: 'globalfilters',
    doc_id: '__default__',
  },
  path: `/${selectedBranch}/globalfilters/config/__default__`,
  name: 'DocumentEditor/DocType/config/DocID',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('SecurityPoliciesEditor.vue', () => {
  let securityPoliciesDocs: SecurityPolicy[]
  let aclDocs: ACLProfile[]
  let contentFilterDocs: ContentFilterProfile[]
  let rateLimitsDocs: RateLimit[]
  let wrapper: VueWrapper
  let mockRouter
  let sendRequestSpy: any
  beforeEach(async () => {
    securityPoliciesDocs = [
      {
        'id': '__default__',
        'name': 'default entry',
        'match': '__default__',
        'map': [
          {
            'id': '__default__',
            'name': 'default',
            'match': '/',
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2'],
          },
          {
            'id': '__defaultentry__',
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
            'id': '123',
            'name': 'default',
            'match': '/',
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2', '365757ec0689'],
          },
          {
            'id': '456',
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
    aclDocs = [
      {
        'id': '__acldefault__',
        'name': 'default acl',
        'allow': [],
        'allow_bot': [
          'google',
        ],
        'deny_bot': [],
        'passthrough': [
          'internal',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'china',
        ],
      },
      {
        'id': '5828321c37e0',
        'name': 'an ACL',
        'allow': [],
        'allow_bot': [
          'google',
          'yahoo',
        ],
        'deny_bot': [],
        'passthrough': [
          'devops',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'iran',
        ],
      },
    ]
    contentFilterDocs = [
      {
        'id': '__defaultcontentfilter__',
        'name': 'default contentfilter',
        'ignore_alphanum': true,
        'headers': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'cookies': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'args': {
          'names': [],
          'regex': [],
          'max_count': 512,
          'max_length': 1024,
        },
        'path': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'decoding': {
          base64: true,
          dual: false,
          html: false,
          unicode: false,
        },
        'masking_seed': '',
        'content_type': [],
        'active': [],
        'report': [],
        'ignore': [],
      },
      {
        'id': '009e846e819e',
        'name': 'example content filter',
        'ignore_alphanum': true,
        'headers': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'cookies': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'args': {
          'names': [],
          'regex': [],
          'max_count': 512,
          'max_length': 1024,
        },
        'path': {
          'names': [],
          'regex': [],
          'max_count': 42,
          'max_length': 1024,
        },
        'decoding': {
          base64: true,
          dual: false,
          html: false,
          unicode: false,
        },
        'masking_seed': '',
        'content_type': [],
        'active': [],
        'report': [],
        'ignore': [],
      },
    ]
    rateLimitsDocs = [
      {
        'id': 'f971e92459e2',
        'name': 'Rate Limit Example Rule 5/60',
        'description': '5 requests per minute',
        'timeframe': '60',
        'thresholds': [
          {
            'limit': '5',
            'action': 'action-rate-limit-block',
          },
        ],
        'include': ['badpeople'],
        'exclude': ['goodpeople'],
        'key': [{'attrs': 'ip'}],
        'pairwith': {'self': 'self'},
      },
      {
        'id': '365757ec0689',
        'name': 'Copy of Rate Limit Example Rule 5/60',
        'description': '5 requests per minute',
        'timeframe': '60',
        'thresholds': [
          {
            'limit': '5',
            'action': 'action-rate-limit-block',
          },
        ],
        'include': ['badpeople'],
        'exclude': ['goodpeople'],
        'key': [{'attrs': 'ip'}],
        'pairwith': {'self': 'self'},
      },
    ]
    sendRequestSpy = jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/aclprofiles/`) {
          if (requestParams.config?.headers?.['x-fields'] === 'id, name') {
            return Promise.resolve(
              {
                data: _.map(aclDocs, (doc: ACLProfile) => {
                  return _.pick(doc, 'id', 'name')
                }),
              },
            )
          }
          return Promise.resolve({data: _.cloneDeep(aclDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/securitypolicies/`) {
          if (requestParams.config?.headers?.['x-fields'] === 'match') {
            return Promise.resolve(
              {
                data: _.map(securityPoliciesDocs, (doc: SecurityPolicy) => {
                  return _.pick(doc, 'match')
                }),
              },
            )
          }
          return Promise.resolve({data: _.cloneDeep(securityPoliciesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/contentfilterprofiles/`) {
          if (requestParams.config?.headers?.['x-fields'] === 'id, name') {
            return Promise.resolve(
              {
                data: _.map(contentFilterDocs, (doc: ContentFilterProfile) => {
                  return _.pick(doc, 'id', 'name')
                }),
              },
            )
          }
          return Promise.resolve({data: _.cloneDeep(contentFilterDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/ratelimits/`) {
          if (requestParams.config?.headers?.['x-fields'] === 'id, name') {
            return Promise.resolve(
              {
                data: _.map(rateLimitsDocs, (doc: RateLimit) => {
                  return _.pick(doc, 'id', 'name')
                }),
              },
            )
          }
          return Promise.resolve({data: _.cloneDeep(rateLimitsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        selectedDoc: securityPoliciesDocs[0],
        selectedBranch: selectedBranch,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
        plugins: [createTestingPinia()],
      },
    })
    const store = useBranchesStore()
    store.selectedBranchId = selectedBranch
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('API requests', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.clearAllTimers()
    })

    test('should not send new requests to API if selected branch does not update', (done) => {
      const branch = _.cloneDeep(selectedBranch)
      wrapper.setProps({
        selectedBranch: branch,
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(sendRequestSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })

    test('should not send new requests to API if selected branch updates to empty string', (done) => {
      wrapper.setProps({
        selectedBranch: '',
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(sendRequestSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })

    test('should not send new requests to API if selected branch updates to null', (done) => {
      wrapper.setProps({
        selectedBranch: null,
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(sendRequestSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })

    test('should not send new requests to API if selected branch updates to undefined', (done) => {
      wrapper.setProps({
        selectedBranch: undefined,
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(sendRequestSpy).toHaveBeenCalledTimes(0)
        done()
      })
    })
  })

  describe('form data', () => {
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(securityPoliciesDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(securityPoliciesDocs[0].name)
    })

    test('should have correct domain match in input', () => {
      const element = wrapper.find('.document-domain-name').element as HTMLInputElement
      expect(element.value).toEqual(securityPoliciesDocs[0].match)
    })

    test('should have correct amount of entry rows in table', () => {
      const table = wrapper.find('.entries-table')
      const entryRows = table.findAll('.entry-row')
      expect(entryRows.length).toEqual(securityPoliciesDocs[0].map.length)
    })

    test('should have correct entry data displayed in non-expanded rows (first row)', () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      const entryName = entryRow.find('.entry-name')
      expect(entryName.text()).toEqual(securityPoliciesDocs[0].map[0].name)
      const entryMatch = entryRow.find('.entry-match')
      expect(entryMatch.text()).toEqual(securityPoliciesDocs[0].map[0].match)
      const entryContentFilter = entryRow.find('.entry-content-filter')
      expect(entryContentFilter.text()).toEqual('default contentfilter')
      const entryACL = entryRow.find('.entry-acl')
      expect(entryACL.text()).toEqual('default acl')
      const entryRateLimitCount = entryRow.find('.entry-rate-limits-count')
      expect(entryRateLimitCount.text()).toEqual(String(securityPoliciesDocs[0].map[0].limit_ids.length))
    })

    test('should have correct entry data displayed in non-expanded rows (second row)', () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(1)
      const entryName = entryRow.find('.entry-name')
      expect(entryName.text()).toEqual(securityPoliciesDocs[0].map[1].name)
      const entryMatch = entryRow.find('.entry-match')
      expect(entryMatch.text()).toEqual(securityPoliciesDocs[0].map[1].match)
      const entryContentFilter = entryRow.find('.entry-content-filter')
      expect(entryContentFilter.text()).toEqual('example content filter')
      const entryACL = entryRow.find('.entry-acl')
      expect(entryACL.text()).toEqual('an ACL')
      const entryRateLimitCount = entryRow.find('.entry-rate-limits-count')
      expect(entryRateLimitCount.text()).toEqual(String(securityPoliciesDocs[0].map[1].limit_ids.length))
    })

    test('should have correct entry data displayed in expanded row', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryName = currentEntryRow.find('.current-entry-name')
      expect((entryName.element as HTMLInputElement).value).toEqual(securityPoliciesDocs[0].map[0].name)
      const entryMatch = currentEntryRow.find('.current-entry-match')
      expect((entryMatch.element as HTMLInputElement).value).toEqual(securityPoliciesDocs[0].map[0].match)
      const entryContentFilterSelection = currentEntryRow.find('.current-entry-content-filter-selection')
      expect((entryContentFilterSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
      const entryContentFilterActive = currentEntryRow.find('.current-entry-content-filter-active')
      expect((entryContentFilterActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[0].content_filter_active)
      const entryACLSelection = currentEntryRow.find('.current-entry-acl-selection')
      expect((entryACLSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
      const entryACLActive = currentEntryRow.find('.current-entry-acl-active')
      expect((entryACLActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[0].acl_active)
    })

    test('should have correct entry rate limit data displayed in expanded row', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
      expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[0].limit_ids.length)
      const rateLimitName = entryRateLimitsRows.at(0).find('.rate-limit-name')
      expect(rateLimitName.text()).toEqual(rateLimitsDocs[0].name)
      const rateLimitDescription = entryRateLimitsRows.at(0).find('.rate-limit-description')
      expect(rateLimitDescription.text()).toEqual(rateLimitsDocs[0].description)
      const rateLimitTTL = entryRateLimitsRows.at(0).find('.rate-limit-timeframe')
      expect(rateLimitTTL.text()).toEqual(rateLimitsDocs[0].timeframe)
    })

    test('should not have rate limit data displayed if no corresponding rate limit exists', async () => {
      securityPoliciesDocs[1].map[0].limit_ids.push('invalid')
      await wrapper.setProps({
        selectedDoc: securityPoliciesDocs[1],
      })
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
      expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[1].map[0].limit_ids.length - 1)
      const rateLimitName0 = entryRateLimitsRows.at(0).find('.rate-limit-name')
      expect(rateLimitName0.text()).toEqual(rateLimitsDocs[0].name)
      const rateLimitName1 = entryRateLimitsRows.at(1).find('.rate-limit-name')
      expect(rateLimitName1.text()).toEqual(rateLimitsDocs[1].name)
    })

    test('should open new rate limit row from add button', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const addButton = entryRateLimitsTable.find('.rate-limit-add-button')
      await addButton.trigger('click')
      const newRateLimitRow = entryRateLimitsTable.find('.new-rate-limit-row')
      expect(newRateLimitRow.exists()).toBeTruthy()
    })

    test('should open new rate limit row from text `here` button if list is empty', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const removeButton = entryRateLimitsTable.find('.rate-limit-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const addButton = entryRateLimitsTable.find('.rate-limit-text-add-button')
      await addButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const enwRateLimitRow = entryRateLimitsTable.find('.new-rate-limit-row')
      expect(enwRateLimitRow.exists()).toBeTruthy()
    })

    test('should have all unselected rate limits in dropdown', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const addButton = entryRateLimitsTable.find('.rate-limit-add-button')
      await addButton.trigger('click')
      const newRateLimitSelection = entryRateLimitsTable.find('.new-rate-limit-selection')
      const options = newRateLimitSelection.findAll('option')
      expect(options.length).toEqual(rateLimitsDocs.length - securityPoliciesDocs[0].map[0].limit_ids.length)
      expect(options.at(0).text()).toEqual(`${rateLimitsDocs[1].name} - ${rateLimitsDocs[1].description}`)
    })

    test('should add selected rate limit from dropdown to table', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const addButton = entryRateLimitsTable.find('.rate-limit-add-button')
      await addButton.trigger('click')
      const newRateLimitSelection = entryRateLimitsTable.find('.new-rate-limit-selection')
      const options = newRateLimitSelection.findAll('option')
      await newRateLimitSelection.setValue(options.at(0).element.value)
      const confirmAddButton = entryRateLimitsTable.find('.rate-limit-confirm-add-button')
      await confirmAddButton.trigger('click')
      const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
      expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[0].limit_ids.length + 1)
    })

    test('should not add a rate limit if nothing is selected in dropdown', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const addButton = entryRateLimitsTable.find('.rate-limit-add-button')
      await addButton.trigger('click')
      const confirmAddButton = entryRateLimitsTable.find('.rate-limit-confirm-add-button')
      await confirmAddButton.trigger('click')
      const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
      expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[0].limit_ids.length)
    })

    test('should remove selected rate limit from table', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const removeButton = entryRateLimitsTable.find('.rate-limit-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
      expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[0].limit_ids.length - 1)
    })

    test('should change route when create new rate limit is clicked', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
      const removeButton = entryRateLimitsTable.find('.rate-limit-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const referralButton = entryRateLimitsTable.find('.rate-limit-referral-button')
      await referralButton.trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith(`/${selectedBranch}/ratelimits/list`)
    })
  })

  describe('form validation', () => {
    beforeEach(async () => {
      mockRoute.params = {
        branch: selectedBranch,
        doc_type: 'globalfilters',
        doc_id: '3086b9c5b518',
      }
      mockRoute.path = `/${selectedBranch}/globalfilters/config/3086b9c5b518`
      wrapper = shallowMount(SecurityPoliciesEditor, {
        props: {
          selectedDoc: securityPoliciesDocs[1],
          selectedBranch: selectedBranch,
        },
        global: {
          mocks: {
            $router: mockRouter,
          },
          plugins: [createTestingPinia()],
        },
      })
      const store = useBranchesStore()
      store.selectedBranchId = selectedBranch
      await nextTick()
    })

    // TODO: Fix regex test for rust standards and re-apply this
    // test('should emit form is invalid when filling match with illegal characters', async () => {
    //   const input = wrapper.find('.document-domain-name')
    //   input.element.value = 'БЮ'
    //   input.trigger('input')
    //   await nextTick()
    //   expect(wrapper.emitted('form-invalid')).toBeTruthy()
    //   expect(wrapper.emitted('form-invalid')[0]).toEqual([true])
    // })

    test('should emit form is valid when changing match to valid one', async () => {
      const input = wrapper.find('.document-domain-name')
      await input.setValue(securityPoliciesDocs[0].match)
      await input.trigger('input')
      // reset all events for clearer event emitting
      wrapper.emitted('form-invalid').length = 0
      await input.setValue('example.com')
      await input.trigger('input')
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
      expect(wrapper.emitted('form-invalid')[0]).toEqual([false])
    })

    test('should emit form is valid when changing match to valid one starting with special character', async () => {
      const input = wrapper.find('.document-domain-name')
      await input.setValue('(api|service).company.(io|com)')
      await input.trigger('input')
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
      expect(wrapper.emitted('form-invalid')[0]).toEqual([false])
    })

    test('should emit form is invalid when changing map entry match to already existing one', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue(securityPoliciesDocs[1].map[1].match)
      await entryMatch.trigger('input')
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
      expect(wrapper.emitted('form-invalid')[0]).toEqual([true])
    })

    // TODO: Fix regex test for rust standards and re-apply this
    // test('should emit form is invalid when filling map entry match with unacceptable characters', async () => {
    //   const table = wrapper.find('.entries-table')
    //   const entryRow = table.findAll('.entry-row').at(0)
    //   entryRow.trigger('click')
    //   await nextTick()
    //   const currentEntryRow = table.find('.current-entry-row')
    //   const entryMatch = currentEntryRow.find('.current-entry-match')
    //   entryMatch.element.value = '/א'
    //   entryMatch.trigger('input')
    //   await nextTick()
    //   expect(wrapper.emitted('form-invalid')).toBeTruthy()
    //   expect(wrapper.emitted('form-invalid')[0]).toEqual([true])
    // })

    test('should emit form is valid when changing map entry match to valid one', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue('/logout')
      await entryMatch.trigger('input')
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
      expect(wrapper.emitted('form-invalid')[0]).toEqual([false])
    })

    test('should revert old entry match data to be valid before switching selected entry', async () => {
      let table = wrapper.find('.entries-table')
      let entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      let currentEntryRow = table.find('.current-entry-row')
      let entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue('')
      await entryMatch.trigger('change')
      await entryMatch.trigger('input')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      currentEntryRow = table.find('.current-entry-row')
      entryMatch = currentEntryRow.find('.current-entry-match')
      expect((entryMatch.element as HTMLInputElement).value).toEqual('/login')
    })

    test('should revert old entry match data to be valid before closing selected entry', async () => {
      let table = wrapper.find('.entries-table')
      let entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      let currentEntryRow = table.find('.current-entry-row')
      let entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue('')
      await entryMatch.trigger('change')
      await entryMatch.trigger('input')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      currentEntryRow = table.find('.current-entry-row')
      entryMatch = currentEntryRow.find('.current-entry-match')
      expect((entryMatch.element as HTMLInputElement).value).toEqual('/login')
    })

    test('should not revert entry match data if valid when switching selected entry', async () => {
      const wantedMatch = '/test'
      let table = wrapper.find('.entries-table')
      let entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      let currentEntryRow = table.find('.current-entry-row')
      let entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue(wantedMatch)
      await entryMatch.trigger('change')
      await entryMatch.trigger('input')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      currentEntryRow = table.find('.current-entry-row')
      entryMatch = currentEntryRow.find('.current-entry-match')
      expect((entryMatch.element as HTMLInputElement).value).toEqual(wantedMatch)
    })

    test('should not revert entry match data if valid when closing selected entry', async () => {
      const wantedMatch = '/test'
      let table = wrapper.find('.entries-table')
      let entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      let currentEntryRow = table.find('.current-entry-row')
      let entryMatch = currentEntryRow.find('.current-entry-match')
      await entryMatch.setValue(wantedMatch)
      await entryMatch.trigger('change')
      await entryMatch.trigger('input')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      table = wrapper.find('.entries-table')
      currentEntryRow = table.find('.current-entry-row')
      entryMatch = currentEntryRow.find('.current-entry-match')
      expect((entryMatch.element as HTMLInputElement).value).toEqual(wantedMatch)
    })

    describe('validation after add or remove map entries', () => {
      let currentEntryRow: any
      let forkButton: any
      let removeButton: any
      beforeEach(async () => {
        const table = wrapper.find('.entries-table')
        const entryRow = table.findAll('.entry-row').at(1)
        await entryRow.trigger('click')
        currentEntryRow = table.find('.current-entry-row')
        forkButton = currentEntryRow.find('.fork-entry-button')
        removeButton = currentEntryRow.find('.remove-entry-button')
      })

      describe('fork', () => {
        test('should emit form is valid when forking an invalid entry', async () => {
          const entryMatch = currentEntryRow.find('.current-entry-match')
          await entryMatch.setValue('')
          await entryMatch.trigger('input')
          // reset all events for clearer event emitting
          wrapper.emitted('form-invalid').length = 0
          await forkButton.trigger('click')
          expect(wrapper.emitted('form-invalid')).toBeTruthy()
          expect(wrapper.emitted('form-invalid')[0]).toEqual([false])
        })

        test('should revert when forking an invalid entry', async () => {
          let entryMatch = currentEntryRow.find('.current-entry-match')
          await entryMatch.setValue('')
          await entryMatch.trigger('change')
          await entryMatch.trigger('input')
          await forkButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          let table = wrapper.find('.entries-table')
          const entryRow = table.findAll('.entry-row').at(2)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          currentEntryRow = table.find('.current-entry-row')
          entryMatch = currentEntryRow.find('.current-entry-match')
          expect((entryMatch.element as HTMLInputElement).value).toEqual('/login')
        })

        test('should not revert entry match data if valid when forking selected entry', async () => {
          const wantedMatch = '/test'
          let entryMatch = currentEntryRow.find('.current-entry-match')
          await entryMatch.setValue(wantedMatch)
          await entryMatch.trigger('change')
          await entryMatch.trigger('input')
          await forkButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          let table = wrapper.find('.entries-table')
          const entryRow = table.findAll('.entry-row').at(2)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          currentEntryRow = table.find('.current-entry-row')
          entryMatch = currentEntryRow.find('.current-entry-match')
          expect((entryMatch.element as HTMLInputElement).value).toEqual(wantedMatch)
        })

        test('should not revert entry match data of new entry when forking selected entry', async () => {
          const validMatch = expect.stringContaining('/new/path/to/match/profile/')
          forkButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          let table = wrapper.find('.entries-table')
          let entryRow = table.findAll('.entry-row').at(1)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          entryRow = table.findAll('.entry-row').at(1)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          currentEntryRow = table.find('.current-entry-row')
          const entryMatch = currentEntryRow.find('.current-entry-match')
          expect((entryMatch.element as HTMLInputElement).value).toEqual(validMatch)
        })

        test('should not revert entry match data of new entry when forking selected entry', async () => {
          const validMatch = expect.stringContaining('/new/path/to/match/profile/')
          forkButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          let table = wrapper.find('.entries-table')
          let entryRow = table.findAll('.entry-row').at(2)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          entryRow = table.findAll('.entry-row').at(1)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          currentEntryRow = table.find('.current-entry-row')
          const entryMatch = currentEntryRow.find('.current-entry-match')
          expect((entryMatch.element as HTMLInputElement).value).toEqual(validMatch)
        })
      })

      describe('remove', () => {
        test('should emit form is valid when deleting an invalid entry', async () => {
          const entryMatch = currentEntryRow.find('.current-entry-match')
          await entryMatch.setValue('')
          await entryMatch.trigger('input')
          // reset all events for clearer event emitting
          wrapper.emitted('form-invalid').length = 0
          await removeButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          expect(wrapper.emitted('form-invalid')).toBeTruthy()
          expect(wrapper.emitted('form-invalid')[0]).toEqual([false])
        })

        test('should not revert entry match data of new selected entry when deleting selected entry', async () => {
          let table = wrapper.find('.entries-table')
          let entryRow = table.findAll('.entry-row').at(1)
          await entryRow.trigger('click')
          removeButton.trigger('click')
          wrapper.vm.$forceUpdate()
          await nextTick()
          table = wrapper.find('.entries-table')
          entryRow = table.findAll('.entry-row').at(0)
          await entryRow.trigger('click')
          table = wrapper.find('.entries-table')
          currentEntryRow = table.find('.current-entry-row')
          const entryMatch = currentEntryRow.find('.current-entry-match')
          expect((entryMatch.element as HTMLInputElement).value).toEqual(securityPoliciesDocs[0].map[0].match)
        })
      })
    })
  })

  // TODO: Fix tests
  describe.skip('add and remove map entries', () => {
    let forkButton: any
    let removeButton: any
    beforeEach(async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(1)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      forkButton = currentEntryRow.find('.fork-entry-button')
      removeButton = currentEntryRow.find('.remove-entry-button')
    })

    describe('fork', () => {
      test('should add another map entry after forking an entry', async () => {
        await forkButton.trigger('click')
        const table = wrapper.find('.entries-table')
        const entryRows = table.findAll('.entry-row')
        expect(entryRows.length).toEqual(securityPoliciesDocs[0].map.length + 1)
      })

      test('should have correct copied data after forking an entry', async () => {
        await forkButton.trigger('click')
        const table = wrapper.find('.entries-table')
        const currentEntryRow = table.find('.current-entry-row')
        const entryName = currentEntryRow.find('.current-entry-name')
        expect((entryName.element as HTMLInputElement).value).toEqual('New Security Profile')
        const entryMatch = currentEntryRow.find('.current-entry-match')
        const validMatch = expect.stringContaining('/new/path/to/match/profile/')
        expect((entryMatch.element as HTMLInputElement).value).toEqual(validMatch)
        const entryContentFilterSelection = currentEntryRow.find('.current-entry-content-filter-selection')
        expect((entryContentFilterSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        const entryContentFilterActive = currentEntryRow.find('.current-entry-content-filter-active')
        expect((entryContentFilterActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[1].content_filter_active)
        const entryACLSelection = currentEntryRow.find('.current-entry-acl-selection')
        expect((entryACLSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        const entryACLActive = currentEntryRow.find('.current-entry-acl-active')
        expect((entryACLActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[1].acl_active)
      })

      test('should have correct copied rate limit data after forking an entry', async () => {
        await forkButton.trigger('click')
        const table = wrapper.find('.entries-table')
        const currentEntryRow = table.find('.current-entry-row')
        const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
        const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
        expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[1].limit_ids.length)
        const rateLimitName = entryRateLimitsRows.at(0).find('.rate-limit-name')
        expect(rateLimitName.text()).toEqual(rateLimitsDocs[1].name)
        const rateLimitDescription = entryRateLimitsRows.at(0).find('.rate-limit-description')
        expect(rateLimitDescription.text()).toEqual(rateLimitsDocs[1].description)
        const rateLimitTTL = entryRateLimitsRows.at(0).find('.rate-limit-timeframe')
        expect(rateLimitTTL.text()).toEqual(rateLimitsDocs[1].timeframe)
      })

      test('should revert old match data to be valid before forking if invalid', async () => {
        let table = wrapper.find('.entries-table')
        let currentEntryRow = table.find('.current-entry-row')
        let entryMatch = currentEntryRow.find('.current-entry-match')
        await entryMatch.setValue('')
        await entryMatch.trigger('change')
        await entryMatch.trigger('input')
        await forkButton.trigger('click')
        table = wrapper.find('.entries-table')
        const entryRow = table.findAll('.entry-row').at(2)
        await entryRow.trigger('click')
        table = wrapper.find('.entries-table')
        currentEntryRow = table.find('.current-entry-row')
        entryMatch = currentEntryRow.find('.current-entry-match')
        expect((entryMatch.element as HTMLInputElement).value).toEqual('/login')
      })

      test('should have correct valid reverted match in forked entry', async () => {
        let table = wrapper.find('.entries-table')
        let currentEntryRow = table.find('.current-entry-row')
        let entryMatch = currentEntryRow.find('.current-entry-match')
        await entryMatch.setValue('')
        await entryMatch.trigger('change')
        await entryMatch.trigger('input')
        await forkButton.trigger('click')
        table = wrapper.find('.entries-table')
        currentEntryRow = table.find('.current-entry-row')
        const entryName = currentEntryRow.find('.current-entry-name')
        expect((entryName.element as HTMLInputElement).value).toEqual('New Security Profile')
        entryMatch = currentEntryRow.find('.current-entry-match')
        const validMatch = expect.stringContaining('/new/path/to/match/profile/')
        expect((entryMatch.element as HTMLInputElement).value).toEqual(validMatch)
        const entryContentFilterSelection = currentEntryRow.find('.current-entry-content-filter-selection')
        expect((entryContentFilterSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        const entryContentFilterActive = currentEntryRow.find('.current-entry-content-filter-active')
        expect((entryContentFilterActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[1].content_filter_active)
        const entryACLSelection = currentEntryRow.find('.current-entry-acl-selection')
        expect((entryACLSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        const entryACLActive = currentEntryRow.find('.current-entry-acl-active')
        expect((entryACLActive.element as HTMLInputElement).checked).toEqual(securityPoliciesDocs[0].map[1].acl_active)
        const entryRateLimitsTable = currentEntryRow.find('.current-entry-rate-limits-table')
        const entryRateLimitsRows = entryRateLimitsTable.findAll('.rate-limit-row')
        expect(entryRateLimitsRows.length).toEqual(securityPoliciesDocs[0].map[1].limit_ids.length)
      })
    })

    describe('remove', () => {
      beforeEach(async () => {
        securityPoliciesDocs[0] = {
          'id': '__default__',
          'name': 'new name',
          'match': 'example.com',
          'map': [
            {
              'id': '123',
              'name': 'one',
              'match': '/one',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': true,
              'limit_ids': ['365757ec0689'],
            },
            {
              'id': '234',
              'name': 'two',
              'match': '/two',
              'acl_profile': '__acldefault__',
              'acl_active': true,
              'content_filter_profile': '__defaultcontentfilter__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2'],
            },
            {
              'id': '345',
              'name': 'three',
              'match': '/three',
              'acl_profile': '__acldefault__',
              'acl_active': true,
              'content_filter_profile': '__defaultcontentfilter__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2'],
            },
            {
              'id': '456',
              'name': 'four',
              'match': '/four',
              'acl_profile': '__acldefault__',
              'acl_active': true,
              'content_filter_profile': '__defaultcontentfilter__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2'],
            },
          ],
        }
        await wrapper.setProps({
          selectedDoc: securityPoliciesDocs[0],
        })
      })

      test('should remove map entry after clicking remove button', async () => {
        removeButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const table = wrapper.find('.entries-table')
        const entryRows = table.findAll('.entry-row')
        expect(entryRows.length).toEqual(securityPoliciesDocs[0].map.length - 1)
      })

      test('should close map entry after clicking remove button', async () => {
        forkButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        removeButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const table = wrapper.find('.entries-table')
        const currentEntryRows = table.findAll('.current-entry-row')
        expect(currentEntryRows.length).toEqual(0)
      })

      test('should not change any other entry after clicking remove button', async () => {
        removeButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const table = wrapper.find('.entries-table')
        const entryRows = table.findAll('.entry-row')
        let entryName
        let entryMatch
        // 0 = first element of map
        entryName = entryRows.at(0).find('.entry-name')
        expect(entryName.text()).toEqual(securityPoliciesDocs[0].map[0].name)
        entryMatch = entryRows.at(0).find('.entry-match')
        expect(entryMatch.text()).toEqual(securityPoliciesDocs[0].map[0].match)
        // 1 = third element of map (second was removed)
        entryName = entryRows.at(1).find('.entry-name')
        expect(entryName.text()).toEqual(securityPoliciesDocs[0].map[2].name)
        entryMatch = entryRows.at(1).find('.entry-match')
        expect(entryMatch.text()).toEqual(securityPoliciesDocs[0].map[2].match)
        // 2 = fourth element of map (second was removed)
        entryName = entryRows.at(2).find('.entry-name')
        expect(entryName.text()).toEqual(securityPoliciesDocs[0].map[3].name)
        entryMatch = entryRows.at(2).find('.entry-match')
        expect(entryMatch.text()).toEqual(securityPoliciesDocs[0].map[3].match)
      })
    })
  })

  // TODO: Fix test
  test.skip('should have forked entry name input focused', async () => {
    const elem = document.createElement('div')
    if (document.body) {
      document.body.appendChild(elem)
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        selectedDoc: securityPoliciesDocs[0],
        selectedBranch,
      },
      global: {
        plugins: [createTestingPinia()],
      },
      attachTo: elem,
    })
    const store = useBranchesStore()
    store.selectedBranchId = selectedBranch
    await nextTick()
    let table = wrapper.find('.entries-table')
    const entryRow = table.findAll('.entry-row').at(1)
    await entryRow.trigger('click')
    let currentEntryRow = table.find('.current-entry-row')
    const forkButton = currentEntryRow.find('.fork-entry-button')
    await forkButton.trigger('click')
    table = wrapper.find('.entries-table')
    currentEntryRow = table.find('.current-entry-row')
    const entryName = currentEntryRow.find('.current-entry-name')
    expect(entryName.element).toBe(document.activeElement)
  })
})
