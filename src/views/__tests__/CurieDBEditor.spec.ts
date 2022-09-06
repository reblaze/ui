// @ts-nocheck
import CurieDBEditor from '@/views/CurieDBEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import axios from 'axios'
import JSONEditor from 'jsoneditor'
import {Commit} from '@/types'
import {setImmediate} from 'timers'
import {nextTick} from 'vue'

jest.mock('axios')
jest.mock('jsoneditor')

describe('CurieDBEditor.vue', () => {
  let wrapper: VueWrapper
  let dbData: any
  let publishInfoData: any
  let dbKeyLogs: Commit[]
  beforeEach(() => {
    publishInfoData = {
      'buckets': [{'name': 'prod', 'url': 's3://curiefense-test01/prod'}, {
        'name': 'devops',
        'url': 's3://curiefense-test01/devops',
      }],
      'branch_buckets': [{'name': 'master', 'buckets': ['prod']}, {'name': 'devops', 'buckets': ['devops']}],
    }
    dbData = {
      'publishinfo': publishInfoData,
      'tags': {
        'neutral': [
          'china',
          'ukraine',
          'internal',
          'devops',
          'google',
          'yahoo',
          'localhost',
          'tor',
          'bad-people',
          'dev',
          'test-tag',
          'all',
          '',
          'okay',
        ],
      },
    }
    dbKeyLogs = [{
      'author': 'Curiefense API',
      'email': 'curiefense@reblaze.com',
      'date': '2020-11-10T09:41:31+02:00',
      'message': 'Setting key [publishinfo] in namespace [system]',
      'version': 'b104d3dd17f790b75c4e067c44bb06b914902d78',
      'parents': ['ff59eb0e6d230c077dfa503c9f2d4aacec1b72ab'],
    }, {
      'author': 'Curiefense API',
      'email': 'curiefense@reblaze.com',
      'date': '2020-08-27T16:19:58+00:00',
      'message': 'Added namespace [system]',
      'version': 'ff59eb0e6d230c077dfa503c9f2d4aacec1b72ab',
      'parents': ['a34f979217215060861b58b3f270e82580c20efb'],
    }]

    JSONEditor.mockImplementation((container, options) => {
      let value = {}
      let onChangeFunc: Function
      if (options.onChange) {
        onChangeFunc = options.onChange
      }
      return {
        set: (newValue: any) => {
          value = newValue
          if (typeof onChangeFunc === 'function') {
            onChangeFunc()
          }
        },
        get: () => {
          return value
        },
      }
    })
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === '/conf/api/v2/db/') {
        return Promise.resolve({data: ['system', 'namespaceCopy', 'anotherDB']})
      }
      const db = wrapper.vm.selectedNamespace
      const key = wrapper.vm.selectedKey
      if (path === `/conf/api/v2/db/new namespace/`) {
        return Promise.resolve({data: {key: {}}})
      }
      if (path === `/conf/api/v2/db/${db}/`) {
        return Promise.resolve({data: dbData})
      }
      if (path === `/conf/api/v2/db/${db}/k/${key}/v/`) {
        return Promise.resolve({data: dbKeyLogs})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(CurieDBEditor)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should have a git history component', () => {
    const gitHistory = wrapper.findComponent(GitHistory)
    expect(gitHistory).toBeTruthy()
  })

  test('should log message when receiving no databases from the server', (done) => {
    const originalLog = console.log
    let consoleOutput: string[] = []
    const mockedLog = (output: string) => consoleOutput.push(output)
    consoleOutput = []
    console.log = mockedLog
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === '/conf/api/v2/db/') {
        return Promise.resolve({data: []})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = mount(CurieDBEditor)
    // allow all requests to finish
    setImmediate(() => {
      expect(consoleOutput).toContain(`failed loading namespace, none are present!`)
      console.log = originalLog
      done()
    })
  })

  test('should be able to switch namespaces through dropdown', () => {
    const wantedValue = 'namespaceCopy'
    const namespaceSelection = wrapper.find('.namespace-selection')
    namespaceSelection.trigger('click')
    const options = namespaceSelection.findAll('option')
    namespaceSelection.setValue(options.at(1).element.value)
    expect(wrapper.vm.selectedNamespace).toEqual(wantedValue)
  })

  test('should be able to switch key through dropdown', () => {
    const wantedValue = Object.keys(dbData)[1]
    const keySelection = wrapper.find('.key-selection')
    keySelection.trigger('click')
    const options = keySelection.findAll('option')
    keySelection.setValue(options.at(1).element.value)
    expect(wrapper.vm.selectedKey).toEqual(wantedValue)
  })

  test('should send API request to restore to the correct version', () => {
    const wantedVersion = {
      version: 'b104d3dd17f790b75c4e067c44bb06b914902d78',
    }
    const putSpy = jest.spyOn(axios, 'put')
    putSpy.mockImplementation(() => Promise.resolve())
    const gitHistory = wrapper.findComponent(GitHistory)
    gitHistory.vm.$emit('restore-version', wantedVersion)
    expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/system/v/${wantedVersion.version}/revert/`)
  })

  test('should load last loaded key if still exists after restoring version', () => {
    const restoredVersion = {
      version: 'b104d3dd17f790b75c4e067c44bb06b914902d78',
    }
    const wantedKey = 'publishinfo'
    wrapper.setData({selectedKey: wantedKey})
    jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
    const gitHistory = wrapper.findComponent(GitHistory)
    gitHistory.vm.$emit('restore-version', restoredVersion)
    expect(wrapper.vm.selectedKey).toEqual(wantedKey)
  })

  test('should load first key if key no longer exists after restoring version', (done) => {
    const restoredVersion = {
      version: 'b104d3dd17f790b75c4e067c44bb06b914902d78',
    }
    const wantedKey = 'publishinfo'
    wrapper.setData({selectedKey: 'somekey'})
    jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
    const gitHistory = wrapper.findComponent(GitHistory)
    gitHistory.vm.$emit('restore-version', restoredVersion)
    // allow all requests to finish
    setImmediate(() => {
      expect(wrapper.vm.selectedKey).toEqual(wantedKey)
      done()
    })
  })

  test('should attempt to download namespace when download button is clicked', async () => {
    const wantedFileName = 'system'
    const wantedFileType = 'json'
    const wantedFileData = dbData
    const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {})
    // force update because downloadFile is mocked after it is read to to be used as event handler
    wrapper.vm.$forceUpdate()
    await nextTick()
    const downloadNamespaceButton = wrapper.find('.download-namespace-button')
    await downloadNamespaceButton.trigger('click')
    expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
  })

  test('should attempt to download key when download button is clicked', async () => {
    const wantedFileName = 'publishinfo'
    const wantedFileType = 'json'
    const wantedFileData = publishInfoData
    const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {})
    // force update because downloadFile is mocked after it is read to be used as event handler
    wrapper.vm.$forceUpdate()
    await nextTick()
    const downloadKeyButton = wrapper.find('.download-key-button')
    await downloadKeyButton.trigger('click')
    expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
  })

  test('should not attempt to download key when download button is clicked if value does not exist', async () => {
    const wantedFileName = 'publishinfo'
    const wantedFileType = 'json'
    const wantedFileData = publishInfoData
    const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {})
    await wrapper.setData({selectedKeyValue: null})
    // force update because downloadFile is mocked after it is read to be used as event handler
    wrapper.vm.$forceUpdate()
    await nextTick()
    const downloadKeyButton = wrapper.find('.download-key-button')
    await downloadKeyButton.trigger('click')
    expect(downloadFileSpy).not.toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
  })

  describe('namespace action buttons', () => {
    test('should be able to fork namespace', async () => {
      const dbData = wrapper.vm.selectedNamespaceData
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const forkNamespaceButton = wrapper.find('.fork-namespace-button')
      await forkNamespaceButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/copy of system/`, dbData)
    })

    test('should be able to add a new namespace', async () => {
      const newNamespace = {
        key: {},
      }
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const newNamespaceButton = wrapper.find('.new-namespace-button')
      await newNamespaceButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/new namespace/`, newNamespace)
    })

    test('should be able to delete a namespace', (done) => {
      jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      // create new namespace so we can delete it
      const newNamespaceButton = wrapper.find('.new-namespace-button')
      newNamespaceButton.trigger('click')
      setImmediate(async () => {
        const namespaceName = wrapper.vm.selectedNamespace
        const deleteNamespaceButton = wrapper.find('.delete-namespace-button')
        await deleteNamespaceButton.trigger('click')
        expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v2/db/${namespaceName}/`)
        done()
      })
    })

    test('should not be able to delete the `system` namespace', async () => {
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      const deleteNamespaceButton = wrapper.find('.delete-namespace-button')
      await deleteNamespaceButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })

  describe('key action buttons', () => {
    test('should be able to fork key', async () => {
      const doc = JSON.parse(wrapper.vm.selectedKeyValue || '{}')
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const forkKeyButton = wrapper.find('.fork-key-button')
      await forkKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/system/k/copy of publishinfo/`, doc)
    })

    test('should be able to add a new key', async () => {
      const newKey = {}
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const newKeyButton = wrapper.find('.new-key-button')
      await newKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/system/k/new key/`, newKey)
    })

    test('should be able to delete a key', (done) => {
      jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      // create new key so we can delete it
      const newKeyButton = wrapper.find('.new-key-button')
      newKeyButton.trigger('click')
      setImmediate(async () => {
        const keyName = wrapper.vm.selectedKey
        const deleteKeyButton = wrapper.find('.delete-key-button')
        await deleteKeyButton.trigger('click')
        expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v2/db/system/k/${keyName}/`)
        done()
      })
    })

    test('should not be able to delete a `publishinfo` key under `system` namespace', async () => {
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      const deleteKeyButton = wrapper.find('.delete-key-button')
      await deleteKeyButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })

  describe('save changes button', () => {
    let putSpy: any
    beforeEach((done) => {
      putSpy = jest.spyOn(axios, 'put')
      // create a new namespace for empty environment to test changes on
      putSpy.mockImplementation(() => Promise.resolve())
      const newNamespaceButton = wrapper.find('.new-namespace-button')
      newNamespaceButton.trigger('click')
      // allow all requests to finish
      setImmediate(() => {
        jest.clearAllMocks()
        putSpy = jest.spyOn(axios, 'put')
        done()
      })
    })

    test('should be able to save namespace changes even if namespace name changes', async () => {
      const namespaceNameInput = wrapper.find('.namespace-name-input')
      const key = 'key_name'
      const value = {
        buckets: {},
        foo: 'bar',
      }
      const wantedResult = {
        [key]: value,
      }
      await namespaceNameInput.setValue('newDB')
      await namespaceNameInput.trigger('input')
      const keyNameInput = wrapper.find('.key-name-input')
      await keyNameInput.setValue(key)
      await keyNameInput.trigger('input')
      wrapper.vm.selectedKeyValue = JSON.stringify(value)
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/newDB/`, wantedResult)
    })

    test('should be able to save key changes even if key name changes', async () => {
      const keyNameInput = wrapper.find('.key-name-input')
      await keyNameInput.setValue('key_name')
      await keyNameInput.trigger('input')
      const value = {
        buckets: {},
        foo: 'bar',
      }
      await wrapper.setData({selectedKeyValue: JSON.stringify(value)})
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/new namespace/k/key_name/`, value)
    })

    test('should be able to save key changes', async () => {
      const value = {
        buckets: {},
        foo: 'bar',
      }
      await wrapper.setData({selectedKeyValue: JSON.stringify(value)})
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/new namespace/k/key/`, value)
    })

    test('should use correct values when saving key changes when using json editor', async () => {
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100)
        await nextTick()
      }
      const value = {
        buckets: {},
        foo: 'bar',
      }
      wrapper.vm.$data.editor.set(value)
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/db/new namespace/k/key/`, value)
    })

    test('should not be able to save key changes' +
      'if value is an invalid json when not using json editor', async () => {
      await wrapper.setData({isJsonEditor: false, editor: null})
      const value = '{'
      const valueInput = wrapper.find('.value-input')
      await valueInput.setValue(value)
      await valueInput.trigger('input')
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })

    test('should not render normal text area if json editor has been loaded', async () => {
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100)
        await nextTick()
      }
      const valueInput = wrapper.find('.value-input')
      expect(valueInput.exists()).toBeFalsy()
    })

    test('should default to normal text area when json editor cannot be loaded after 2 seconds', async () => {
      wrapper = mount(CurieDBEditor)
      JSONEditor.mockImplementation(() => {
        throw new Error('ouchie')
      })
      for (let i = 0; i < 21; i++) {
        jest.advanceTimersByTime(100)
        await nextTick()
      }
      const valueInput = wrapper.find('.value-input')
      expect(valueInput.exists()).toBeTruthy()
    })

    test('should not be able to save key changes if namespace name is empty', async () => {
      const namespaceNameInput = wrapper.find('.namespace-name-input')
      await namespaceNameInput.setValue('')
      await namespaceNameInput.trigger('input')
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })

    test('should not be able to save key changes if namespace name is duplicate of another namespace', async () => {
      const namespaceNameInput = wrapper.find('.namespace-name-input')
      await namespaceNameInput.setValue('namespaceCopy')
      await namespaceNameInput.trigger('input')
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })

    test('should not be able to save key changes if key name is empty', async () => {
      const keyNameInput = wrapper.find('.key-name-input')
      await keyNameInput.setValue('')
      await keyNameInput.trigger('input')
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })

    test('should not be able to save key changes if key name is duplicate of another key', async () => {
      // add a new key so we would have multiple keys
      const newKeyButton = wrapper.find('.new-key-button')
      await newKeyButton.trigger('click')
      // change key name
      const keyNameInput = wrapper.find('.key-name-input')
      await keyNameInput.setValue('key')
      await keyNameInput.trigger('input')
      // reset spy counter
      jest.clearAllMocks()
      axios.put = jest.fn()
      putSpy = jest.spyOn(axios, 'put')
      // attempt saving duplicate named key
      const saveKeyButton = wrapper.find('.save-button')
      await saveKeyButton.trigger('click')
      expect(putSpy).not.toHaveBeenCalled()
    })
  })

  describe('no data', () => {
    test('should display correct message when there is no namespace list data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/db/') {
          return Promise.resolve({data: []})
        }
        return Promise.resolve({data: {}})
      })
      wrapper = mount(CurieDBEditor)
      // allow all requests to finish
      setImmediate(() => {
        const noDataMessage = wrapper.find('.no-data-message')
        expect(noDataMessage?.exists()).toBeTruthy()
        expect(noDataMessage?.text()?.toLowerCase()).toContain('no data found!')
        expect(noDataMessage?.text()?.toLowerCase()).toContain('missing namespace.')
        done()
      })
    })

    test('should display correct message when there is no key data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/db/') {
          return Promise.resolve({data: ['system', 'namespaceCopy', 'anotherDB']})
        }
        const db = wrapper.vm.selectedNamespace
        if (path === `/conf/api/v2/db/${db}/`) {
          return Promise.resolve({data: {}})
        }
        return Promise.resolve({
          data: {},
        })
      })
      wrapper = mount(CurieDBEditor)
      // allow all requests to finish
      setImmediate(() => {
        const noDataMessage = wrapper.find('.no-data-message')
        expect(noDataMessage?.exists()).toBeTruthy()
        expect(noDataMessage?.text()?.toLowerCase()).toContain('no data found!')
        expect(noDataMessage?.text()?.toLowerCase()).toContain('missing key.')
        done()
      })
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when namespaces list not loaded', () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/db/') {
          return new Promise(() => {
          })
        }
        return Promise.resolve({data: []})
      })
      wrapper = mount(CurieDBEditor)
      const valueLoadingIndicator = wrapper.find('.value-loading')
      expect(valueLoadingIndicator.exists()).toBeTruthy()
    })

    test('should display loading indicator when namespace not loaded', () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/db/') {
          return Promise.resolve({data: ['system', 'namespaceCopy', 'anotherDB']})
        }
        const db = wrapper.vm.selectedNamespace
        if (path === `/conf/api/v2/db/${db}/`) {
          return new Promise(() => {
          })
        }
        return Promise.resolve({data: {}})
      })
      wrapper = mount(CurieDBEditor)
      const valueLoadingIndicator = wrapper.find('.value-loading')
      expect(valueLoadingIndicator.exists()).toBeTruthy()
    })

    test('should display loading indicator when saving value changes', async () => {
      jest.spyOn(axios, 'put').mockImplementation(() => new Promise(() => {
      }))
      const saveDocumentButton = wrapper.find('.save-button')
      await saveDocumentButton.trigger('click')
      expect(saveDocumentButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when forking namespace', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const forkNamespaceButton = wrapper.find('.fork-namespace-button')
      await forkNamespaceButton.trigger('click')
      expect(forkNamespaceButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when adding a new namespace', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const newNamespaceButton = wrapper.find('.new-namespace-button')
      await newNamespaceButton.trigger('click')
      expect(newNamespaceButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when deleting a namespace', (done) => {
      jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      jest.spyOn(axios, 'delete').mockImplementation(() => new Promise(() => {
      }))
      // create new namespace so we can delete it
      const newNamespaceButton = wrapper.find('.new-namespace-button')
      newNamespaceButton.trigger('click')
      setImmediate(async () => {
        const deleteNamespaceButton = wrapper.find('.delete-namespace-button')
        await deleteNamespaceButton.trigger('click')
        expect(deleteNamespaceButton.element.classList).toContain('is-loading')
        done()
      })
    })

    test('should display loading indicator when forking key', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const forkKeyButton = wrapper.find('.fork-key-button')
      await forkKeyButton.trigger('click')
      expect(forkKeyButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when adding a new key', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const newKeyButton = wrapper.find('.new-key-button')
      await newKeyButton.trigger('click')
      expect(newKeyButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when deleting a key', (done) => {
      jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
      jest.spyOn(axios, 'delete').mockImplementation(() => new Promise(() => {
      }))
      // create new namespace so we can delete it
      const newNamespaceButton = wrapper.find('.new-key-button')
      newNamespaceButton.trigger('click')
      setImmediate(async () => {
        const deleteNamespaceButton = wrapper.find('.delete-key-button')
        await deleteNamespaceButton.trigger('click')
        expect(deleteNamespaceButton.element.classList).toContain('is-loading')
        done()
      })
    })
  })
})
