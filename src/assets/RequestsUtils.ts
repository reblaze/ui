import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'
import {HttpRequestMethods} from '@/types'
import {useBranchesStore} from '@/stores/BranchesStore'

const confAPIRoot = '/conf/api'
const confAPIVersion = 'v3'
const reblazeAPIRoot = '/reblaze/api'
const reblazeAPIVersion = 'v3'
const dataLayerAPIRoot = '/datalayer/api'
const dataLayerAPIVersion = 'v1.0'

// eslint-disable-next-line no-unused-vars
const axiosMethodsMap: Partial<{ [key in HttpRequestMethods]: Function }> = {
  'GET': axios.get,
  'PUT': axios.put,
  'POST': axios.post,
  'DELETE': axios.delete,
}

const processRequest = (methodName: HttpRequestMethods, apiUrl: string, data: any, config: AxiosRequestConfig,
                        successMessage: string, failureMessage: string, undoFunction: () => any, onFail?: Function) => {
  // Get correct axios method
  if (!methodName) {
    methodName = 'GET'
  } else {
    methodName = <HttpRequestMethods>methodName.toUpperCase()
  }
  const axiosMethod = axiosMethodsMap[methodName]
  if (!axiosMethod) {
    console.error(`Attempted sending unrecognized request method ${methodName}`)
    return
  }

  // Request
  console.log(`Sending ${methodName} request to url ${apiUrl}`)
  let request
  if (data) {
    if (config) {
      request = axiosMethod(apiUrl, data, config)
    } else {
      request = axiosMethod(apiUrl, data)
    }
  } else {
    if (config) {
      request = axiosMethod(apiUrl, config)
    } else {
      request = axiosMethod(apiUrl)
    }
  }
  request = request.then((response: AxiosResponse) => {
    // Toast message
    if (successMessage) {
      Utils.toast(successMessage, 'is-success', undoFunction)
    }
    // Update commit counters
    if (methodName !== 'GET') {
      const store = useBranchesStore()
      store.increaseCommitsCounter()
    }
    return response
  }).catch((error: Error) => {
    // Toast message
    if (failureMessage) {
      Utils.toast(failureMessage, 'is-danger', undoFunction)
    }
    if (typeof onFail === 'function') {
      onFail()
    }
    console.error(error)
  })
  return request
}

export interface IRequestParams {
  methodName: HttpRequestMethods,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  successMessage?: string,
  failureMessage?: string,
  undoFunction?: () => any,
  onFail?: Function,
}

const sendRequest = (requestParams: IRequestParams) => {
  const {methodName, url, data, config, successMessage, failureMessage, undoFunction, onFail} = requestParams
  const apiUrl = `${confAPIRoot}/${confAPIVersion}/${url}`
  return processRequest(methodName, apiUrl, data, config, successMessage, failureMessage, undoFunction, onFail)
}

const sendReblazeRequest = (requestParams: IRequestParams) => {
  const {methodName, url, data, config, successMessage, failureMessage, undoFunction, onFail} = requestParams
  const apiUrl = `${reblazeAPIRoot}/${reblazeAPIVersion}/reblaze/${url}`
  return processRequest(methodName, apiUrl, data, config, successMessage, failureMessage, undoFunction, onFail)
}

const sendDataLayerRequest = (requestParams: IRequestParams) => {
  const {methodName, url, data, config, successMessage, failureMessage, undoFunction, onFail} = requestParams
  const apiUrl = `${dataLayerAPIRoot}/${dataLayerAPIVersion}/${url}`
  return processRequest(methodName, apiUrl, data, config, successMessage, failureMessage, undoFunction, onFail)
}

export default {
  name: 'RequestsUtils',
  sendRequest,
  confAPIRoot,
  confAPIVersion,
  sendReblazeRequest,
  reblazeAPIRoot,
  reblazeAPIVersion,
  sendDataLayerRequest,
  dataLayerAPIRoot,
  dataLayerAPIVersion,
}
