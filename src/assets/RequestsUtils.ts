import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'
import {HttpRequestMethods} from '@/types'
import {useBranchesStore} from '@/stores/BranchesStore'
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'

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

const processRequest = (requestParams: IRequestParams) => {
  // Get correct axios method
  if (!requestParams.methodName) {
    requestParams.methodName = 'GET'
  } else {
    requestParams.methodName = <HttpRequestMethods>requestParams.methodName.toUpperCase()
  }
  const axiosMethod = axiosMethodsMap[requestParams.methodName]
  if (!axiosMethod) {
    console.error(`Attempted sending unrecognized request method ${requestParams.methodName}`)
    return
  }

  // Request
  const identifier = DatasetsUtils.generateUUID2()
  console.log(`Sending ${requestParams.methodName} request to url ${requestParams.url} with identifier ${identifier}`)
  let request
  if (requestParams.data) {
    if (requestParams.config) {
      request = axiosMethod(requestParams.url, requestParams.data, requestParams.config)
    } else {
      request = axiosMethod(requestParams.url, requestParams.data)
    }
  } else {
    if (requestParams.config) {
      request = axiosMethod(requestParams.url, requestParams.config)
    } else {
      request = axiosMethod(requestParams.url)
    }
  }
  request = request.then((response: AxiosResponse) => {
    console.log(`Response received for request with identifier ${identifier}: ${JSON.stringify(response)}`)
    // Follow redirect
    if (response?.headers?.location) {
      window.location.href = response.headers.location
    }
    if (response?.request?.responseURL) {
      window.location.href = response.request.responseURL
    }
    // Toast message
    if (requestParams.successMessage) {
      Utils.toast(requestParams.successMessage, 'is-success', requestParams.undoFunction)
    }
    // Update commit counters
    if (requestParams.methodName !== 'GET' && !requestParams.skipIncreaseCommitsCounterOnSuccess) {
      const store = useBranchesStore()
      store.increaseCommitsCounter()
    }
    return response
  }).catch((error: Error) => {
    // Toast message
    if (requestParams.failureMessage) {
      Utils.toast(requestParams.failureMessage, 'is-danger', requestParams.undoFunction)
    }
    if (typeof requestParams.onFail === 'function') {
      requestParams.onFail()
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
  skipIncreaseCommitsCounterOnSuccess?: boolean,
  undoFunction?: () => any,
  onFail?: Function,
}

const sendRequest = (requestParams: IRequestParams) => {
  requestParams = _.cloneDeep(requestParams)
  requestParams.url = `${confAPIRoot}/${confAPIVersion}/${requestParams.url}`
  return processRequest(requestParams)
}

const sendReblazeRequest = (requestParams: IRequestParams) => {
  requestParams = _.cloneDeep(requestParams)
  requestParams.url = `${reblazeAPIRoot}/${reblazeAPIVersion}/reblaze/${requestParams.url}`
  return processRequest(requestParams)
}

const sendDataLayerRequest = (requestParams: IRequestParams) => {
  requestParams = _.cloneDeep(requestParams)
  requestParams.url = `${dataLayerAPIRoot}/${dataLayerAPIVersion}/${requestParams.url}`
  requestParams.skipIncreaseCommitsCounterOnSuccess = true
  return processRequest(requestParams)
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
