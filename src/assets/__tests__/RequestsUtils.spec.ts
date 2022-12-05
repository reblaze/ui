// @ts-nocheck
import RequestsUtils, {IRequestParams} from '@/assets/RequestsUtils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import * as bulmaToast from 'bulma-toast'
import {Options} from 'bulma-toast'
import axios from 'axios'

jest.mock('axios')

describe('RequestsUtils.ts', () => {
  let getSpy: any
  let putSpy: any
  let postSpy: any
  let deleteSpy: any
  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve())
    putSpy = jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
    postSpy = jest.spyOn(axios, 'post').mockImplementation(() => Promise.resolve())
    deleteSpy = jest.spyOn(axios, 'delete').mockImplementation(() => Promise.resolve())
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  function buildFuncDescribe(requestFunc: Function, baseUrl: string, urlTrail: string) {
    describe(`${requestFunc.name} function`, () => {
      const apiUrl = `${baseUrl}${urlTrail}`
      const url = urlTrail
      const data = {
        id: 'a240gava',
        name: 'A name',
      }

      describe('basic usage', () => {
        test('should send GET request correctly', async () => {
          await requestFunc({methodName: 'GET', url})
          expect(getSpy).toHaveBeenCalledWith(apiUrl)
        })

        test('should send PUT request correctly', async () => {
          await requestFunc({methodName: 'PUT', url, data})
          expect(putSpy).toHaveBeenCalledWith(apiUrl, data)
        })

        test('should send POST request correctly', async () => {
          await requestFunc({methodName: 'POST', url, data})
          expect(postSpy).toHaveBeenCalledWith(apiUrl, data)
        })

        test('should send DELETE request correctly', async () => {
          await requestFunc({methodName: 'DELETE', url})
          expect(deleteSpy).toHaveBeenCalledWith(apiUrl)
        })

        test('should send POST request correctly with header config and data', async () => {
          const config = {headers: {'x-fields': 'name'}}
          await requestFunc({methodName: 'POST', url, data, config})
          expect(postSpy).toHaveBeenCalledWith(apiUrl, data, config)
        })

        test('should send POST request correctly with header config without data', async () => {
          const config = {headers: {'x-fields': 'name'}}
          await requestFunc({methodName: 'POST', url, config})
          expect(postSpy).toHaveBeenCalledWith(apiUrl, config)
        })

        test('should send GET request correctly when method name is not capitalized', async () => {
          await requestFunc({methodName: 'get', url})
          expect(getSpy).toHaveBeenCalledWith(apiUrl)
        })

        test('should send GET request correctly when method name is not prompted', async () => {
          await requestFunc({url})
          expect(getSpy).toHaveBeenCalledWith(apiUrl)
        })
      })

      describe('logging', () => {
        const originalLog = console.log
        let consoleOutput: string[] = []
        const mockedLog = (output: string) => consoleOutput.push(output)
        beforeEach(() => {
          consoleOutput = []
          console.log = mockedLog
        })
        afterEach(() => {
          console.log = originalLog
        })

        test('should log GET request correctly', async () => {
          await requestFunc({methodName: 'GET', url})
          expect(consoleOutput).toContain(`Sending GET request to url ${apiUrl}`)
        })

        test('should log PUT request correctly', async () => {
          await requestFunc({methodName: 'PUT', url, data})
          expect(consoleOutput).toContain(`Sending PUT request to url ${apiUrl}`)
        })

        test('should log POST request correctly', async () => {
          await requestFunc({methodName: 'POST', url, data})
          expect(consoleOutput).toContain(`Sending POST request to url ${apiUrl}`)
        })

        test('should log DELETE request correctly', async () => {
          await requestFunc({methodName: 'DELETE', url})
          expect(consoleOutput).toContain(`Sending DELETE request to url ${apiUrl}`)
        })

        test('should send error when attempting to send request with unrecognized request method', async () => {
          const originalError = console.error
          console.error = (output: string) => consoleOutput.push(output)
          const weirdRequestMethod = 'POTATO' as IRequestParams['methodName']
          await requestFunc({methodName: weirdRequestMethod, url})
          expect(consoleOutput).toContain(`Attempted sending unrecognized request method ${weirdRequestMethod}`)
          console.error = originalError
        })
      })

      describe('toast messages', () => {
        const successMessage = 'yay we did it!'
        const successMessageClass = 'is-success'
        const failureMessage = 'oops, something went wrong'
        const failureMessageClass = 'is-danger'
        let toastOutput: Options[] = []
        beforeEach(() => {
          toastOutput = []
          jest.spyOn(bulmaToast, 'toast').mockImplementation((output: Options) => {
            toastOutput.push(output)
          })
        })
        afterEach(() => {
          jest.clearAllMocks()
        })

        test('should not send success toast when GET request is rejected if not set', async () => {
          await requestFunc({methodName: 'GET', url, failureMessage})
          expect(toastOutput.length).toEqual(0)
        })

        test('should send success toast when GET request returns successfully', async () => {
          await requestFunc({methodName: 'GET', url, successMessage, failureMessage})
          expect(toastOutput[0].message).toContain(successMessage)
          expect(toastOutput[0].type).toContain(successMessageClass)
        })

        test('should send success toast when PUT request returns successfully', async () => {
          await requestFunc({methodName: 'PUT', url, data, successMessage, failureMessage})
          expect(toastOutput[0].message).toContain(successMessage)
          expect(toastOutput[0].type).toContain(successMessageClass)
        })

        test('should send success toast when POST request returns successfully', async () => {
          await requestFunc({methodName: 'POST', url, data, successMessage, failureMessage})
          expect(toastOutput[0].message).toContain(successMessage)
          expect(toastOutput[0].type).toContain(successMessageClass)
        })

        test('should send success toast when DELETE request returns successfully', async () => {
          await requestFunc({methodName: 'DELETE', url, successMessage, failureMessage})
          expect(toastOutput[0].message).toContain(successMessage)
          expect(toastOutput[0].type).toContain(successMessageClass)
        })

        test('should not send failure toast when GET request is rejected if not set', (done) => {
          jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject(new Error()))
          const onFail = () => {
            expect(toastOutput.length).toEqual(0)
            done()
          }
          requestFunc({methodName: 'GET', url, successMessage, onFail})
        })

        test('should send failure toast when GET request is rejected', (done) => {
          jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject(new Error()))
          const onFail = () => {
            expect(toastOutput[0].message).toContain(failureMessage)
            expect(toastOutput[0].type).toContain(failureMessageClass)
            done()
          }
          requestFunc({methodName: 'GET', url, successMessage, failureMessage, onFail})
        })

        test('should send failure toast when PUT request is rejected', (done) => {
          jest.spyOn(axios, 'put').mockImplementationOnce(() => Promise.reject(new Error()))
          const onFail = () => {
            expect(toastOutput[0].message).toContain(failureMessage)
            expect(toastOutput[0].type).toContain(failureMessageClass)
            done()
          }
          requestFunc({methodName: 'PUT', url, data, successMessage, failureMessage, onFail})
        })

        test('should send failure toast when POST request is rejected', (done) => {
          jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.reject(new Error()))
          const onFail = () => {
            expect(toastOutput[0].message).toContain(failureMessage)
            expect(toastOutput[0].type).toContain(failureMessageClass)
            done()
          }
          requestFunc({methodName: 'POST', url, data, successMessage, failureMessage, onFail})
        })

        test('should send failure toast when DELETE request is rejected', (done) => {
          jest.spyOn(axios, 'delete').mockImplementationOnce(() => Promise.reject(new Error()))
          const onFail = () => {
            expect(toastOutput[0].message).toContain(failureMessage)
            expect(toastOutput[0].type).toContain(failureMessageClass)
            done()
          }
          requestFunc({methodName: 'DELETE', url, successMessage, failureMessage, onFail})
        })
      })

      describe('redirect response', () => {
        let originalLocation
        beforeEach(() => {
          const location = JSON.stringify(window.location)
          originalLocation = window.location
          delete window.location

          window.location = JSON.parse(location)
          window.location.href = 'http://localhost/test'
        })
        afterEach(() => {
          window.location = originalLocation
        })

        test('should not attempt to redirect if no redirect info received from the server', async () => {
          getSpy = jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve())
          await requestFunc({methodName: 'GET', url})
          expect(window.location.href).toEqual('http://localhost/test')
          jest.clearAllMocks()
        })

        test('should attempt to redirect if redirect info received from the server', async () => {
          const wantedURL = 'http://127.0.0.1/testOtherPath'
          getSpy = jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({
            request: {
              location: wantedURL,
            },
          }))
          await requestFunc({methodName: 'GET', url})
          expect(window.location.href).toEqual(wantedURL)
          jest.clearAllMocks()
        })
      })
    })
  }

  const sendRequestBaseUrl = `${RequestsUtils.confAPIRoot}/${RequestsUtils.confAPIVersion}/`
  const sendRequestUrlTrail = 'configs/prod/'
  const sendReblazeRequestBaseUrl = `${RequestsUtils.reblazeAPIRoot}/${RequestsUtils.reblazeAPIVersion}/reblaze/`
  const sendReblazeRequestUrlTrail = 'config/planet/'
  const sendDataLayerRequestBaseUrl = `${RequestsUtils.dataLayerAPIRoot}/${RequestsUtils.dataLayerAPIVersion}/`
  const sendDataLayerRequestUrlTrail = 'metrics'
  buildFuncDescribe(RequestsUtils.sendRequest, sendRequestBaseUrl, sendRequestUrlTrail)
  buildFuncDescribe(RequestsUtils.sendReblazeRequest, sendReblazeRequestBaseUrl, sendReblazeRequestUrlTrail)
  buildFuncDescribe(RequestsUtils.sendDataLayerRequest, sendDataLayerRequestBaseUrl, sendDataLayerRequestUrlTrail)
})
