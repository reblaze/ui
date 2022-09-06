// @ts-nocheck
import {VueWrapper} from '@vue/test-utils'
import SecurityPoliciesEditor from '@/doc-editors/SecurityPoliciesEditor.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import {ACLProfile, ContentFilterProfile, RateLimit, SecurityPolicy} from '@/types'
import axios from 'axios'
import _ from 'lodash'
import {setImmediate} from 'timers'
import {nextTick} from 'vue'

jest.mock('axios')

describe('SecurityPoliciesEditor.vue', () => {
  let securityPoliciesDocs: SecurityPolicy[]
  let aclDocs: ACLProfile[]
  let contentFilterDocs: ContentFilterProfile[]
  let rateLimitsDocs: RateLimit[]
  let selectedBranch: string
  let wrapper: VueWrapper
  let mockRouter
  let axiosGetSpy: any
  beforeEach(() => {
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
    aclDocs = [
      {
        'id': '__default__',
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
        'id': '__default__',
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
            'action': {'type': 'default', 'params': {'action': {'type': 'default', 'params': {}}}},
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
            'action': {'type': 'default', 'params': {'action': {'type': 'default', 'params': {}}}},
          },
        ],
        'include': ['badpeople'],
        'exclude': ['goodpeople'],
        'key': [{'attrs': 'ip'}],
        'pairwith': {'self': 'self'},
      },
    ]
    selectedBranch = 'master'
    axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation((path, config) => {
      console.log('path', path, 'config', config)
      if (!wrapper) {
        return Promise.resolve({data: []})
      }
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/aclprofiles/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve(
            {
              data: _.map(aclDocs, (doc: ACLProfile) => {
                return _.pick(doc, 'id', 'name')
              }),
            },
          )
        }
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/securitypolicies/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve(
            {
              data: _.map(securityPoliciesDocs, (doc: SecurityPolicy) => {
                return _.pick(doc, 'id', 'name')
              }),
            },
          )
        }
        return Promise.resolve({data: securityPoliciesDocs})
      }
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/contentfilterprofiles/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve(
            {
              data: _.map(contentFilterDocs, (doc: ContentFilterProfile) => {
                return _.pick(doc, 'id', 'name')
              }),
            },
          )
        }
        return Promise.resolve({data: contentFilterDocs})
      }
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/ratelimits/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve(
            {
              data: _.map(rateLimitsDocs, (doc: RateLimit) => {
                return _.pick(doc, 'id', 'name')
              }),
            },
          )
        }
        return Promise.resolve({data: rateLimitsDocs})
      }
      if (path === `/conf/api/v2/configs/${selectedBranch}/d/ratelimits/e/f971e92459e2/`) {
        return Promise.resolve({data: rateLimitsDocs[0]})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }
    const onUpdate = (some1: ComponentNameType) => {
      wrapper.setProps({selectedDoc: some1})
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        'selectedDoc': securityPoliciesDocs[0],
        selectedBranch,
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
  })

  test('should update initial domain match if selectedDoc updates from a state without match', (done) => {
    const wantedMatch = 'www.example.com'
    const basicDataPolicy = {
      'id': '__default__',
      'name': 'default entry',
    }
    const fullPolicy = {
      ...basicDataPolicy,
      'match': wantedMatch,
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
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        selectedDoc: basicDataPolicy,
        selectedBranch,
      },
    })
    wrapper.setProps({selectedDoc: fullPolicy})
    // allow all requests to finish
    jest.useFakeTimers()
    setImmediate(() => {
      expect((wrapper.vm).initialDocDomainMatch).toBe(wantedMatch)
      jest.useRealTimers()
      done()
    })
  })

  test('should not update initial domain match if selectedDoc updates from a state with empty match', (done) => {
    const wantedMatch = ''
    const basicDataPolicy = {
      'id': '__default__',
      'name': 'default entry',
      'match': '',
    }
    const fullPolicy = {
      ...basicDataPolicy,
      'match': 'www.example.com',
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
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        selectedDoc: basicDataPolicy,
        selectedBranch,
      },
    })
    wrapper.setProps({selectedDoc: fullPolicy})
    // allow all requests to finish
    setImmediate(() => {
      expect((wrapper.vm).initialDocDomainMatch).toBe(wantedMatch)
      done()
    })
  })

  test('should not send new requests to API if selected branch does not update', (done) => {
    jest.resetAllMocks()
    const branch = _.cloneDeep(selectedBranch)
    wrapper.setProps({
      selectedBranch: branch,
    })
    // allow all requests to finish
    setImmediate(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(0)
      done()
    })
  })

  test('should not send new requests to API if selected branch updates to empty string', (done) => {
    jest.resetAllMocks()
    wrapper.setProps({
      selectedBranch: '',
    })
    // allow all requests to finish
    setImmediate(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(0)
      done()
    })
  })

  test('should not send new requests to API if selected branch updates to null', (done) => {
    jest.resetAllMocks()
    wrapper.setProps({
      selectedBranch: null,
    })
    // allow all requests to finish
    setImmediate(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(0)
      done()
    })
  })

  test('should not send new requests to API if selected branch updates to undefined', (done) => {
    jest.resetAllMocks()
    wrapper.setProps({
      selectedBranch: undefined,
    })
    // allow all requests to finish
    setImmediate(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(0)
      done()
    })
  })

  test('should send a single new request to API if selected branch updates', (done) => {
    jest.resetAllMocks()
    const branch = 'devops'
    wrapper.setProps({
      selectedBranch: branch,
    })
    wrapper.vm.$forceUpdate()
    setImmediate(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  test('should not change the initial domain match if document data updates with new data and same ID', async () => {
    jest.resetAllMocks()
    let newDomainMatch = 'example.com'
    let newId = '__default__'
    // we need to change ID to set the initialDocDomainMatch so when we try to change it again
    // but with the same ID it does not change.
    securityPoliciesDocs[0] = {
      'id': newId,
      'name': 'new name',
      'match': newDomainMatch,
      'map': [
        {
          'name': 'one',
          'match': '/one',
          'acl_profile': '5828321c37e0',
          'acl_active': false,
          'content_filter_profile': '009e846e819e',
          'content_filter_active': true,
          'limit_ids': ['365757ec0689'],
        },
        {
          'name': 'two',
          'match': '/two',
          'acl_profile': '__default__',
          'acl_active': true,
          'content_filter_profile': '__default__',
          'content_filter_active': false,
          'limit_ids': ['f971e92459e2'],
        },
      ],
    }
    const wantedDomainMatch = securityPoliciesDocs[0].match
    newDomainMatch = 'example.com'
    newId = '__newid__'
    securityPoliciesDocs[0] = {
      'id': newId,
      'name': 'new name',
      'match': newDomainMatch,
      'map': [
        {
          'name': 'one',
          'match': '/one',
          'acl_profile': '5828321c37e0',
          'acl_active': false,
          'content_filter_profile': '009e846e819e',
          'content_filter_active': true,
          'limit_ids': ['365757ec0689'],
        },
        {
          'name': 'two',
          'match': '/two',
          'acl_profile': '__default__',
          'acl_active': true,
          'content_filter_profile': '__default__',
          'content_filter_active': false,
          'limit_ids': ['f971e92459e2'],
        },
      ],
    }
    await wrapper.setProps({
      selectedDoc: securityPoliciesDocs[0],
    })
    newDomainMatch = 'myexample.com'
    newId = '__newid__'
    securityPoliciesDocs[0] = {
      'id': newId,
      'name': 'new name',
      'match': newDomainMatch,
      'map': [
        {
          'name': 'one',
          'match': '/one',
          'acl_profile': '5828321c37e0',
          'acl_active': false,
          'content_filter_profile': '009e846e819e',
          'content_filter_active': true,
          'limit_ids': ['365757ec0689'],
        },
        {
          'name': 'two',
          'match': '/two',
          'acl_profile': '__default__',
          'acl_active': true,
          'content_filter_profile': '__default__',
          'content_filter_active': false,
          'limit_ids': ['f971e92459e2'],
        },
      ],
    }
    expect((wrapper.vm).initialDocDomainMatch).toEqual(wantedDomainMatch)
  })

  test('should change the initial domain match if document data updates with new ID', async () => {
    jest.resetAllMocks()
    const wantedDomainMatch = securityPoliciesDocs[1].match
    await wrapper.setProps({
      selectedDoc: securityPoliciesDocs[1],
    })
    expect((wrapper.vm).initialDocDomainMatch).toEqual(wantedDomainMatch)
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
      expect((entryContentFilterActive.element as HTMLInputElement).checked)
        .toEqual(securityPoliciesDocs[0].map[0].content_filter_active)
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
      expect(options.at(0).text()).toEqual(`${rateLimitsDocs[1].name} ${rateLimitsDocs[1].description}`)
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
      expect(mockRouter.push).toHaveBeenCalledTimes(1)
      expect(mockRouter.push).toHaveBeenCalledWith(`/config/${selectedBranch}/ratelimits`)
    })
  })

  describe('form validation', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        selectedDoc: securityPoliciesDocs[1],
      })
    })

    test('should emit form is invalid when changing match to already existing one', async () => {
      const input = wrapper.find('.document-domain-name')
      await input.setValue(securityPoliciesDocs[0].match)
      await input.trigger('input')
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
      expect(wrapper.emitted('form-invalid')[0]).toEqual([true])
    })

    // TODO: Fix regex test for rust standards and re-apply this
    // test('should emit form is invalid when filling match with illegal characters', async () => {
    //   const input = wrapper.find('.document-domain-name');
    //   (input.element as HTMLInputElement).value = 'БЮ'
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
    //   const entryMatch = currentEntryRow.find('.current-entry-match');
    //   (entryMatch.element as HTMLInputElement).value = '/א'
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

  describe('add and remove map entries', () => {
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
        expect((entryContentFilterActive.element as HTMLInputElement).checked)
          .toEqual(securityPoliciesDocs[0].map[1].content_filter_active)
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
        expect((entryContentFilterActive.element as HTMLInputElement).checked)
          .toEqual(securityPoliciesDocs[0].map[1].content_filter_active)
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
              'name': 'one',
              'match': '/one',
              'acl_profile': '5828321c37e0',
              'acl_active': false,
              'content_filter_profile': '009e846e819e',
              'content_filter_active': true,
              'limit_ids': ['365757ec0689'],
            },
            {
              'name': 'two',
              'match': '/two',
              'acl_profile': '__default__',
              'acl_active': true,
              'content_filter_profile': '__default__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2'],
            },
            {
              'name': 'three',
              'match': '/three',
              'acl_profile': '__default__',
              'acl_active': true,
              'content_filter_profile': '__default__',
              'content_filter_active': false,
              'limit_ids': ['f971e92459e2'],
            },
            {
              'name': 'four',
              'match': '/four',
              'acl_profile': '__default__',
              'acl_active': true,
              'content_filter_profile': '__default__',
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

  test('should have forked entry name input focused', (done) => {
    const elem = document.createElement('div')
    if (document.body) {
      document.body.appendChild(elem)
    }
    wrapper = shallowMount(SecurityPoliciesEditor, {
      props: {
        selectedDoc: securityPoliciesDocs[0],
        selectedBranch,
      },
      attachTo: elem,
    })
    let table = wrapper.find('.entries-table')
    const entryRow = table.findAll('.entry-row').at(1)
    entryRow.trigger('click')
    setImmediate(() => {
      let currentEntryRow = table.find('.current-entry-row')
      const forkButton = currentEntryRow.find('.fork-entry-button')
      forkButton.trigger('click')
      table = wrapper.find('.entries-table')
      currentEntryRow = table.find('.current-entry-row')
      const entryName = currentEntryRow.find('.current-entry-name')
      setImmediate(() => {
        expect(entryName.element).toBe(document.activeElement)
        done()
      })
    })
  })
})
