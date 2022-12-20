// @ts-nocheck
import RoutingProfilesEditor from '@/doc-editors/RoutingProfilesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {BackendService, EdgeFunction, RoutingProfile, Site} from '@/types'
import {createTestingPinia} from '@pinia/testing'
import {nextTick} from 'vue'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import Utils from '../../assets/Utils'
import DatasetsUtils from '../../assets/DatasetsUtils'
import _ = require('lodash')

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
    doc_id: 'a80420a71989',
  },
  path: `/${selectedBranch}/routing-profiles/config/a80420a71989`,
  name: 'RoutingProfiles/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('RoutingProfilesEditor.vue', () => {
  let routingProfilesDocs: RoutingProfile[]
  let serverGroupsDocs: Site[]
  let backendServicesDocs: BackendService[]
  let edgeFunctionsDocs: EdgeFunction[]
  let mockRouter: any
  let wrapper: VueWrapper
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    routingProfilesDocs = [
      {
        'description': 'A description',
        'id': 'a80420a71989',
        'locations': [
          {
            'backend_id': '__default__',
            'cloud_functions': ['f971e92459e2'],
            'id': 'e327665d9470',
            'path': '/',
          },
          {
            'backend_id': 'c84a01fbe369',
            'cloud_functions': ['f123456789'],
            'id': '871ebfe196e6',
            'path': '/',
          },
        ],
        'name': 'Routing Profile test with some data',
      },
      {
        'id': '__default__',
        'locations': [{
          'backend_id': 'c84a01fbe369',
          'cloud_functions': ['__default__', 'f123456789'],
          'id': '__root_entry__',
          'path': '/',
        }],
        'name': 'default routing',
      },
      {
        'description': 'New Routing Profile Description and Remarks',
        'id': '376d4487e17a',
        'locations': [{
          'backend_id': '__default__',
          'cloud_functions': ['f123456789'],
          'id': 'd87f297cf1c6',
          'path': '/',
        }],
        'name': 'New Routing Profile 376d4487e17a',
      },
    ]
    serverGroupsDocs = [
      {
        'id': '__default__',
        'mobile_sdk': '',
        'name': 'default.site',
        'proxy_template': '__default__',
        'routing_profile': '376d4487e17a',
        'security_policy': '__default__',
        'server_names': ['default.site'],
        'ssl_certificate': 'placeholder',
      },
    ]
    backendServicesDocs = [
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': '127.0.0.1',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '',
            'weight': 1,
          },
        ],
        'description': 'New Backend Service Description and Remarks',
        'http11': true,
        'id': '6f6295de664f',
        'least_conn': false,
        'name': 'New Backend Service 6f6295de664f',
        'sticky': 'none',
        'transport_mode': 'default',
      },
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': 'test-example.com',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '0',
            'weight': 1,
          },
        ],
        'description': '',
        'http11': true,
        'id': 'c84a01fbe369',
        'least_conn': false,
        'name': 'example-com',
        'sticky': 'none',
        'sticky_cookie_name': '',
        'transport_mode': 'default',
      },
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': 'example.com',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '0',
            'weight': 1,
          },
        ],
        'description': '',
        'http11': true,
        'id': '__default__',
        'least_conn': false,
        'name': 'test-example-com',
        'sticky': 'none',
        'sticky_cookie_name': '',
        'transport_mode': 'default',
      },
    ]
    edgeFunctionsDocs = [
      {
        'id': 'f971e92459e2',
        'name': 'New Edge Functions',
        'description': '5 requests per minute',
        'phase': 'request',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
      {
        'id': 'f123456789',
        'name': 'New Edge Function',
        'description': '2 requests per minute',
        'phase': 'response',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
      {
        'id': '__default__',
        'name': 'Default Edge Function',
        'description': '2 requests per minute',
        'phase': 'response',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/e/a80420a71989/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs[0])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/routing-profiles/e/__default__/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs[1])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/routing-profiles/e/376d4487e17a/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs[2])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
          return Promise.resolve({data: _.cloneDeep(serverGroupsDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/backends/`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/cloud-functions/`) {
          return Promise.resolve({data: _.cloneDeep(edgeFunctionsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(RoutingProfilesEditor, {
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
    jest.clearAllTimers()
  })

  describe('form data', () => {
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(routingProfilesDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(routingProfilesDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(routingProfilesDocs[0].description)
    })

    test('should have correct amount of entry rows in table', () => {
      const table = wrapper.find('.entries-table')
      const entryRows = table.findAll('.entry-row')
      expect(entryRows.length).toEqual(routingProfilesDocs[0].locations.length)
    })

    test('should have correct entry data displayed in non-expanded rows (first row)', () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      const entryPath = entryRow.find('.entry-path')
      expect(entryPath.text()).toEqual(routingProfilesDocs[0].locations[0].path)
      const entryBackendService = entryRow.find('.entry-backend-service')
      expect(entryBackendService.text()).toEqual('test-example-com')
      const entryEdgeFunctionsCount = entryRow.find('.entry-edge-functions-count')
      expect(entryEdgeFunctionsCount.text()).toEqual(String(routingProfilesDocs[0].locations[0].cloud_functions.length))
    })

    test('should have correct entry data displayed in non-expanded rows (second row)', () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(1)
      const entryPath = entryRow.find('.entry-path')
      expect(entryPath.text()).toEqual(routingProfilesDocs[0].locations[1].path)
      const entryBackendService = entryRow.find('.entry-backend-service')
      expect(entryBackendService.text()).toEqual('example-com')
      const entryEdgeFunctionsCount = entryRow.find('.entry-edge-functions-count')
      expect(entryEdgeFunctionsCount.text()).toEqual(String(routingProfilesDocs[0].locations[1].cloud_functions.length))
    })

    test('should have correct entry data displayed in expanded row', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryPath = currentEntryRow.find('.current-entry-path')
      expect((entryPath.element as HTMLInputElement).value).toEqual(routingProfilesDocs[0].locations[0].path)
      const entryBackendServiceSelection = currentEntryRow.find('.current-entry-backend-service-selection')
      expect((entryBackendServiceSelection.element as HTMLSelectElement).selectedIndex).toEqual(2)
    })

    test('should have correct entry Edge Function data displayed in expanded row', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const entryEdgeFunctionsRows = entryEdgeFunctionsTable.findAll('.edge-function-row')
      expect(entryEdgeFunctionsRows.length).toEqual(routingProfilesDocs[0].locations[0].cloud_functions.length)
      const edgeFunctionName = entryEdgeFunctionsRows.at(0).find('.edge-function-name')
      expect(edgeFunctionName.text()).toEqual(edgeFunctionsDocs[0].name)
      const edgeFunctionDescription = entryEdgeFunctionsRows.at(0).find('.edge-function-description')
      expect(edgeFunctionDescription.text()).toEqual(edgeFunctionsDocs[0].description)
      const edgeFunctionPhase = entryEdgeFunctionsRows.at(0).find('.edge-function-phase')
      expect(edgeFunctionPhase.text()).toEqual(edgeFunctionsDocs[0].phase)
    })

    // TODO: Fix test - there's a data leak and it affects other tests
    test.skip('should not have Edge Function data displayed if no corresponding Edge Function exists', async () => {
      routingProfilesDocs[1].locations[0].cloud_functions.push('invalid')
      mockRoute.params = {
        branch: selectedBranch,
        doc_type: 'routing-profiles',
        doc_id: routingProfilesDocs[1].id,
      }
      mockRoute.path = `/${selectedBranch}/routing-profiles/config/${routingProfilesDocs[1].id}`
      wrapper = mount(RoutingProfilesEditor, {
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

      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const entryEdgeFunctionsRows = entryEdgeFunctionsTable.findAll('.edge-function-row')
      expect(entryEdgeFunctionsRows.length).toEqual(routingProfilesDocs[1].locations[0].cloud_functions.length - 1)
      const edgeFunctionName0 = entryEdgeFunctionsRows.at(0).find('.edge-function-name')
      expect(edgeFunctionName0.text()).toEqual(edgeFunctionsDocs[0].name)
      const edgeFunctionName1 = entryEdgeFunctionsRows.at(1).find('.edge-function-name')
      expect(edgeFunctionName1.text()).toEqual(edgeFunctionsDocs[1].name)
    })

    test('should open new Edge Function row from add button', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const addButton = entryEdgeFunctionsTable.find('.edge-function-add-button')
      await addButton.trigger('click')
      const newEdgeFunctionRow = entryEdgeFunctionsTable.find('.new-edge-function-row')
      expect(newEdgeFunctionRow.exists()).toBeTruthy()
    })

    test('should open new Edge Function row from text `here` button if list is empty', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const removeButton = entryEdgeFunctionsTable.find('.edge-function-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const addButton = entryEdgeFunctionsTable.find('.edge-function-text-add-button')
      await addButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const newEdgeFunctionRow = entryEdgeFunctionsTable.find('.new-edge-function-row')
      expect(newEdgeFunctionRow.exists()).toBeTruthy()
    })

    test('should have all unselected Edge Functions in dropdown', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const addButton = entryEdgeFunctionsTable.find('.edge-function-add-button')
      await addButton.trigger('click')
      const newEdgeFunctionSelection = entryEdgeFunctionsTable.find('.new-edge-function-selection')
      const options = newEdgeFunctionSelection.findAll('option')
      expect(options.length).toEqual(edgeFunctionsDocs.length - routingProfilesDocs[0].locations[0].cloud_functions.length)
      expect(options.at(0).text()).toEqual(`${edgeFunctionsDocs[1].name} - ${edgeFunctionsDocs[1].description}`)
    })

    test('should add selected Edge Function from dropdown to table', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const addButton = entryEdgeFunctionsTable.find('.edge-function-add-button')
      await addButton.trigger('click')
      const newEdgeFunctionSelection = entryEdgeFunctionsTable.find('.new-edge-function-selection')
      const options = newEdgeFunctionSelection.findAll('option')
      await newEdgeFunctionSelection.setValue(options.at(0).element.value)
      const confirmAddButton = entryEdgeFunctionsTable.find('.edge-function-confirm-add-button')
      await confirmAddButton.trigger('click')
      const entryEdgeFunctionsRows = entryEdgeFunctionsTable.findAll('.edge-function-row')
      expect(entryEdgeFunctionsRows.length).toEqual(routingProfilesDocs[0].locations[0].cloud_functions.length + 1)
    })

    test('should not add a Edge Function if nothing is selected in dropdown', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const addButton = entryEdgeFunctionsTable.find('.edge-function-add-button')
      await addButton.trigger('click')
      const confirmAddButton = entryEdgeFunctionsTable.find('.edge-function-confirm-add-button')
      await confirmAddButton.trigger('click')
      const entryEdgeFunctionsRows = entryEdgeFunctionsTable.findAll('.edge-function-row')
      expect(entryEdgeFunctionsRows.length).toEqual(routingProfilesDocs[0].locations[0].cloud_functions.length)
    })

    test('should remove selected Edge Function from table', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const removeButton = entryEdgeFunctionsTable.find('.edge-function-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entryEdgeFunctionsRows = entryEdgeFunctionsTable.findAll('.edge-function-row')
      expect(entryEdgeFunctionsRows.length).toEqual(routingProfilesDocs[0].locations[0].cloud_functions.length - 1)
    })

    test.skip('should change route when create new Edge Function is clicked', async () => {
      const table = wrapper.find('.entries-table')
      const entryRow = table.findAll('.entry-row').at(0)
      await entryRow.trigger('click')
      const currentEntryRow = table.find('.current-entry-row')
      const entryEdgeFunctionsTable = currentEntryRow.find('.current-entry-edge-functions-table')
      const removeButton = entryEdgeFunctionsTable.find('.edge-function-remove-button')
      await removeButton.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const referralButton = entryEdgeFunctionsTable.find('.edge-function-referral-button')
      await referralButton.trigger('click')
      expect(mockRouter.push).toHaveBeenCalledWith(`/${selectedBranch}/clout-functions/list`)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/routing-profiles/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedRoutingProfile
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'PUT',
        url: `configs/${selectedBranch}/d/routing-profiles/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedRoutingProfile
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/routing-profiles/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['routing-profiles']()
      newDoc.name = expect.stringMatching('New Routing Profile')
      newDoc.id = expect.any(String)
      newDoc.locations[0].id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/routing-profiles/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      await wrapper.setData({selectedDocID: 'a80420a71989'})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'DELETE',
        url: `configs/${selectedBranch}/d/routing-profiles/e/${routingProfilesDocs[0].id}/`,
      }))
    })

    test('should not be able to delete a document if its id starts with `__`', async () => {
      await wrapper.setData({selectedDocID: '__default__'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a document if it is referenced by a Server Group', async () => {
      await wrapper.setData({selectedDocID: '376d4487e17a'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'routing-profile'
      const wantedFileType = 'json'
      const wantedFileData = routingProfilesDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
