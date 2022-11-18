// @ts-nocheck
import EdgeFunctionsEditor from '@/doc-editors/EdgeFunctionsEditor.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {EdgeFunction} from '@/types'
import axios from 'axios'

jest.mock('axios')

// TODO: Resolve pinia integration with jest and remove this skip
describe.skip('EdgeFunctionsEditor.vue', () => {
  let edgeFunctionsDocs: EdgeFunction[]
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(() => {
    edgeFunctionsDocs = [{
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
    }]

    const selectedBranch = 'prod'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/cloud-functions/`) {
        return Promise.resolve({data: edgeFunctionsDocs})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(EdgeFunctionsEditor, {
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
      expect(wrapper.find('.document-id').text()).toEqual(edgeFunctionsDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].description)
    })

    test('should have correct phase in dropdown', () => {
      const element = wrapper.find('.phase-selection').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].phase)
    })
  })
})
