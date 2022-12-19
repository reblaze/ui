// @ts-nocheck
import GenerateCertificate from '@/doc-editors/popups/GenerateCertificate.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {nextTick} from 'vue'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/ssl/list`,
  name: 'SSL/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('GenerateCertificate.vue', () => {
  let sendReblazeRequestSpy: any
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(async () => {
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          return Promise.resolve({data: []})
        },
    )
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(GenerateCertificate, {
      global: {
      },
      props: {
        selectedBranch: selectedBranch,
      },
    })
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('should check manual input by default', () => {
    const manualInputTitle = wrapper.find('.man-input-title').text()
    expect(manualInputTitle).toBe('Input Certificate Manually')
  })

  test('should change the manual input message while choose extract radio button', async () => {
    const extractradioButton = wrapper.find('#extract')
    await extractradioButton.trigger('change')
    const extractInputTitle = wrapper.find('.extract-input-title').text()
    expect(extractInputTitle).toBe('Extract Certificate From File')
  })

  test('should close the modal on X button', async () => {
    const xButton = wrapper.find('.close-modal')
    await xButton.trigger('click')
    expect(wrapper.emitted('close-modal')).toBeTruthy()
  })

  describe('manual input', () => {
    test('should check if typing correct manual certificate will work', async () => {
        const privateKeyMock = 'Private key mock'
        const certificateBodyMock = 'Certificate body mock'
        const newCertificate = DatasetsUtils.newOperationEntryFactory['certificates']()
        newCertificate.id = expect.any(String)
        newCertificate.private_key = privateKeyMock
        newCertificate.cert_body = certificateBodyMock
        const privateKeyInput = wrapper.find('.private-key-textarea')
        await privateKeyInput.setValue(privateKeyMock)
        const certificateBodyInput = wrapper.find('.certificate-body-textarea')
        await certificateBodyInput.setValue(certificateBodyMock)
        const saveButton = wrapper.find('.save-button')
        await saveButton.trigger('click')
        expect(sendReblazeRequestSpy).toHaveBeenCalled()
        expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: expect.stringMatching(`configs/${selectedBranch}/d/certificates/e/`),
          data: newCertificate,
        }))
        expect(wrapper.emitted('call-load-certificate')).toBeTruthy()
        expect(wrapper.emitted('close-modal')).toBeTruthy()
    })
  })

  /* describe('extract input', () => {
    test('should check if typing correct manual certificate will work', async () => {
        const extractradioButton = wrapper.find('#extract')
        await extractradioButton.trigger('change')
        const fileInput = wrapper.find('.file-input')
        const blob = new Blob([""], { type: "application/x-pkcs12" })
          blob["lastModifiedDate"] = ""
          blob["name"] = "test"
          const file = <File>blob;
          const fileList : FileList = 
          {
            0: file,
            length: 1,
            item: (index: number) => file
          }
        fileInput.element.files = fileList
        await fileInput.trigger('input')
        expect(wrapper.find('.file-password')).toBeTruthy()
        /* const saveButton = wrapper.find('.save-button')
        await saveButton.trigger('click')
        expect(sendReblazeRequestSpy).toHaveBeenCalled()
        expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: expect.stringMatching(`configs/${selectedBranch}/d/certificates/e/`),
          data: newCertificate,
        }))
        expect(wrapper.emitted('call-load-certificate')).toBeTruthy()
        expect(wrapper.emitted('close-modal')).toBeTruthy()
    })
  }) */
})
