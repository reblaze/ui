// @ts-nocheck
import DocumentList from '@/views/DocumentList.vue'
import GitHistory from '@/components/GitHistory.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, shallowMount, VueWrapper} from '@vue/test-utils'
import axios from 'axios'
import _ from 'lodash'
import {ACLProfile, DocumentType, FlowControlPolicy, GlobalFilter} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/aclprofiles/list`,
  name: 'DocumentList/DocType/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('DocumentList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let aclDocs: ACLProfile[]
  let globalFilterDocs: GlobalFilter[]
  let flowControlPolicyDocs: FlowControlPolicy[]
  let sendRequestSpy: any
  beforeEach(async () => {
    aclDocs = [
      {
        'id': '__acldefault__',
        'name': 'default-acl',
        'tags': ['google', 'china'],
      },
      {
        'id': '5828321c37e0',
        'name': 'an ACL',
        'tags': ['google', 'yahoo', 'devops'],
      },
    ]
    globalFilterDocs = [
      {
        'id': 'xlbp148c',
        'name': 'API Discovery',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'Tag API Requests',
        'active': true,
        'tags': ['api'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]}],
        },
      }, {
        'id': '07656fbe',
        'name': 'devop internal demo',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'this is my own list',
        'active': false,
        'tags': ['internal', 'devops'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]}],
        },
      },
    ]
    flowControlPolicyDocs = [
      {
        'active': true,
        'description': '',
        'exclude': [],
        'include': ['all'],
        'name': 'flow control policy',
        'key': [
          {'headers': 'something'},
        ],
        'sequence': [
          {
            'method': 'GET',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {},
            'args': {},
          },
          {
            'method': 'POST',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'test': 'one',
            },
            'args': {},
          },
        ],
        'action': 'monitor',
        'timeframe': 60,
        'id': 'c03dabe4b9ca',
      },
      {
        'active': true,
        'description': '',
        'exclude': [],
        'include': ['all'],
        'name': 'flow control policy 2',
        'key': [
          {'headers': 'something'},
        ],
        'sequence': [
          {
            'method': 'GET',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {},
            'args': {},
          },
          {
            'method': 'POST',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'test': 'one',
            },
            'args': {},
          },
        ],
        'action': 'monitor',
        'timeframe': 60,
        'id': '4435d797ab0c',
      },
    ]
    sendRequestSpy = jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        const branch = wrapper.vm.selectedBranch
        if (requestParams.url === `configs/${branch}/d/aclprofiles/`) {
          const aclXFields = _.flatMap(wrapper.vm.columnOptionMap['aclprofiles'], 'fieldNames')
          aclXFields.unshift('id')
          if (requestParams.config?.headers?.['x-fields'] === aclXFields.join(', ')) {
            return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, aclXFields))})
          }
          return Promise.resolve({data: aclDocs})
        }
        if (requestParams.url === `configs/prod/d/globalfilters/`) {
          const globalFilterXFields = _.flatMap(wrapper.vm.columnOptionMap['globalfilters'], 'fieldNames')
          globalFilterXFields.unshift('id')
          if (requestParams.config?.headers?.['x-fields'] === globalFilterXFields.join(', ')) {
            return Promise.resolve({data: _.map(globalFilterDocs, (i) => _.pick(i, globalFilterXFields))})
          }
          return Promise.resolve({data: globalFilterDocs})
        }
        if (requestParams.url === `configs/zzz_branch/d/globalfilters/`) {
          globalFilterDocs.shift()
          const globalFilterXFields = _.flatMap(wrapper.vm.columnOptionMap['globalfilters'], 'fieldNames')
          globalFilterXFields.unshift('id')
          if (requestParams.config?.headers?.['x-fields'] === globalFilterXFields.join(', ')) {
            return Promise.resolve({data: _.map(globalFilterDocs, (i) => _.pick(i, globalFilterXFields))})
          }
          return Promise.resolve({data: globalFilterDocs})
        }
        if (requestParams.url === `configs/${branch}/d/flowcontrol/`) {
          const flowcontrolXFields = _.flatMap(wrapper.vm.columnOptionMap?.flowcontrol, 'fieldNames')
          flowcontrolXFields.unshift('id')
          if (requestParams.config?.headers?.['x-fields'] === flowcontrolXFields.join(', ')) {
            return Promise.resolve({data: _.map(flowControlPolicyDocs, (i) => _.pick(i, flowcontrolXFields))})
          }
          return Promise.resolve({data: flowControlPolicyDocs})
        }
        return Promise.resolve({data: []})
      })
    jest.spyOn(axios.CancelToken, 'source').mockImplementation(() => {
      return {
        token: null,
        cancel: () => {
        },
      }
    })
    mockRouter = {
      push: jest.fn((val) => {
        const splitParams = val.split('/')
        wrapper.vm.$route.params = {
          branch: splitParams[2],
          doc_type: splitParams[3],
        }
        wrapper.vm.$route.path = val
      }),
    }
    wrapper = shallowMount(DocumentList, {
      global: {
        mocks: {
          $route: mockRoute,
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
  })

  describe('git history', () => {
    test('should have a git history component', () => {
      const gitHistory = wrapper.findComponent(GitHistory)
      expect(gitHistory).toBeTruthy()
    })
  })

  // describe.skip('route params', () => {
  //   let router
  //   let rbzTable
  //   beforeEach(async () => {
  //     router = createRouter({
  //       history: createWebHistory(process.env.BASE_URL),
  //       routes,
  //     })
  //     router.push('/zzz_branch/flowcontrol/list')
  //     await router.isReady()
  //     wrapper = mount(DocumentList, {
  //       global: {
  //         plugins: [router, createTestingPinia()],
  //       },
  //     })
  //     rbzTable = wrapper.findComponent(RbzTable)
  //   })
  //
  //   test('should load correct branch from route when valid', () => {
  //     expect(wrapper.vm.selectedBranch).toEqual('zzz_branch')
  //   })
  //
  //   test('should load correct doc type from route when valid', () => {
  //     expect(wrapper.vm.selectedDocType).toEqual('flowcontrol')
  //   })
  //
  //   test('should load correct default branch if got non existent branch in route params', (done) => {
  //     router.push('/random123/random123/list')
  //     setImmediate(() => {
  //       expect(wrapper.vm.selectedBranch).toEqual('prod')
  //       done()
  //     })
  //   })
  //
  //   test('should load correct default branch if none given in route params', (done) => {
  //     router.push('//random123/random123')
  //     setImmediate(() => {
  //       expect(wrapper.vm.selectedBranch).toEqual('prod')
  //       done()
  //     })
  //   })
  //
  //   test('should load correct default document type if non existent in route params', (done) => {
  //     router.push('/zzz_branch/random123/list')
  //     setImmediate(() => {
  //       expect(wrapper.vm.selectedDocType).toEqual('globalfilters')
  //       expect(rbzTable.vm.data[0].name).toEqual('devop internal demo')
  //       done()
  //     })
  //   })
  //
  //   test('should load correct default document type if none given in route params', (done) => {
  //     router.push('/zzz_branch//list')
  //     setImmediate(() => {
  //       expect(wrapper.vm.selectedDocType).toEqual('globalfilters')
  //       expect(rbzTable.vm.data[0].name).toEqual('devop internal demo')
  //       done()
  //     })
  //   })
  //
  //   test('should load correct data when changing doc type', (done) => {
  //     router.push('/prod/aclprofiles/list')
  //     setImmediate(() => {
  //       expect(wrapper.vm.selectedDocType).toEqual('aclprofiles')
  //       expect(rbzTable.vm.data[0].name).toEqual('default-acl')
  //       done()
  //     })
  //   })
  //
  //   test('should not load new data if new route is not DocumentList', (done) => {
  //     const spy = jest.spyOn(wrapper.vm, 'setSelectedDataFromRouteParams')
  //     router.push('/prod/aclprofiles/config')
  //     setImmediate(() => {
  //       expect(spy).not.toHaveBeenCalled()
  //       done()
  //     })
  //   })
  // })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          const branch = wrapper.vm.selectedBranch
          const doctype = wrapper.vm.selectedDocType
          if (requestParams.url === `configs/${branch}/d/${doctype}/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
          plugins: [createTestingPinia()],
        },
      })
      const store = useBranchesStore()
      store.selectedBranchId = selectedBranch
      await nextTick()
      const docLoadingIndicator = wrapper.find('.document-loading')
      expect(docLoadingIndicator.exists()).toBeTruthy()
    })
  })

  describe('buttons', () => {
    describe('download button', () => {
      test('should not attempt to download document when download button is clicked' +
        ' if the full docs data was not loaded yet', async () => {
        jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
          (requestParams: IRequestParams) => {
            const branch = wrapper.vm.selectedBranch
            if (requestParams.url === `configs/${branch}/d/aclprofiles/`) {
              const aclXFields = _.flatMap(wrapper.vm.columnOptionMap['aclprofiles'], 'fieldNames')
              aclXFields.unshift('id')
              if (requestParams.config?.headers?.['x-fields'] === aclXFields.join(', ')) {
                return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, aclXFields))})
              }
              return new Promise(() => {
              })
            }
            return Promise.resolve({data: []})
          })
        const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
        })
        wrapper = shallowMount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
            plugins: [createTestingPinia()],
          },
        })
        const store = useBranchesStore()
        store.selectedBranchId = selectedBranch
        await nextTick()
        const downloadDocButton = wrapper.find('.download-document-button')
        await downloadDocButton.trigger('click')
        expect(downloadFileSpy).not.toHaveBeenCalled()
      })

      test('should attempt to download document when download button is clicked', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'aclprofiles'})
        const originalDocs = wrapper.vm.docs
        wrapper.setData({docs: aclDocs})
        await nextTick()
        const wantedFileName = 'aclprofiles'
        const wantedFileType = 'json'
        const wantedFileData = aclDocs
        const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
        })
        await nextTick()
        const downloadDocButton = wrapper.find('.download-document-button')
        await downloadDocButton.trigger('click')
        expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
        wrapper.setData({selectedDocType: originalDocType})
        wrapper.setData({docs: originalDocs})
      })
    })

    describe('new document button', () => {
      test('should be able to add a new aclprofiles document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'aclprofiles'})
        await nextTick()
        const newACLProfilesDoc = DatasetsUtils.newDocEntryFactory.aclprofiles()
        newACLProfilesDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/aclprofiles/e/`,
          data: newACLProfilesDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })

      test('should be able to add a new globalfilters document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'globalfilters'})
        await nextTick()
        const newGlobalFiltersDoc = DatasetsUtils.newDocEntryFactory.globalfilters()
        newGlobalFiltersDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/globalfilters/e/`,
          data: newGlobalFiltersDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })

      test('should be able to add a new contentfilterprofiles document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'contentfilterprofiles'})
        await nextTick()
        const newContentFilterProfilesDoc = DatasetsUtils.newDocEntryFactory.contentfilterprofiles()
        newContentFilterProfilesDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/contentfilterprofiles/e/`,
          data: newContentFilterProfilesDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })

      test('should be able to add a new ratelimits document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'ratelimits'})
        await nextTick()
        const newRateLimitsDoc = DatasetsUtils.newDocEntryFactory.ratelimits()
        newRateLimitsDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/ratelimits/e/`,
          data: newRateLimitsDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })

      test('should be able to add a new flowcontrol document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'flowcontrol'})
        await nextTick()
        const newFlowControlDoc = DatasetsUtils.newDocEntryFactory.flowcontrol()
        newFlowControlDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/flowcontrol/e/`,
          data: newFlowControlDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })

      test('should be able to add a new contentfilterrules document', async () => {
        const originalDocType = wrapper.vm.selectedDocType
        wrapper.setData({selectedDocType: 'contentfilterrules'})
        await nextTick()
        const newContentFilterRulesDoc = DatasetsUtils.newDocEntryFactory.contentfilterrules()
        newContentFilterRulesDoc.id = expect.any(String)
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('new-button-clicked')
        expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/contentfilterrules/e/`,
          data: newContentFilterRulesDoc,
        }))
        wrapper.setData({selectedDocType: originalDocType})
      })
    })

    describe('edit document button', () => {
      test('should redirect to correct document when clicking on edit document button', async () => {
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('row-button-clicked', aclDocs[1]['id'])
        expect(mockRouter.push).toHaveBeenCalledWith(`/prod/globalfilters/config/${aclDocs[1]['id']}`)
        rbzTable.vm.$emit('row-button-clicked', aclDocs[0]['id'])
        expect(mockRouter.push).toHaveBeenCalledWith(`/prod/globalfilters/config/${aclDocs[0]['id']}`)
      })
    })
  })

  describe('document column options', () => {
    const buildColumnOptionsTest = (docType: DocumentType) => {
      test(`should load correct column options for ${docType}`, async () => {
        mockRoute.params = {
          branch: 'prod',
          doc_type: docType,
        }
        mockRoute.path = `/list/prod/${docType}`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
            plugins: [createTestingPinia()],
          },
        })
        const store = useBranchesStore()
        store.selectedBranchId = selectedBranch
        await nextTick()
        expect(wrapper.vm.columns).toEqual(wrapper.vm.columnOptionMap[docType])
        const defaultDoc = DatasetsUtils.newDocEntryFactory[docType]()
        _.forEach(wrapper.vm.columnOptionMap[docType], (columnOptions) => {
          if (typeof columnOptions.displayFunction === 'function') {
            expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
          }
        })
      })
    }

    const documentTypes: DocumentType[] = [
      'aclprofiles',
      'flowcontrol',
      'globalfilters',
      'ratelimits',
      'securitypolicies',
      'contentfilterprofiles',
      'contentfilterrules',
      'actions',
    ]
    documentTypes.forEach((docType) => {
      buildColumnOptionsTest(docType)
    })
  })
})
