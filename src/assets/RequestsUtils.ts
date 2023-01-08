import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'
import {HttpRequestMethods} from '@/types'
import {useBranchesStore} from '@/stores/BranchesStore'
// import {useUserStore} from '@/stores/userStore'
import _ from 'lodash'

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
  console.log(`Sending ${requestParams.methodName} request to url ${requestParams.url}`)
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
    // Set last seen for the active user
    // TODO: return last seen once definition is more clear
    // const lastSeen = response?.headers?.date ? new Date(response.headers.date) : new Date()
    // const secondsSinceEpoch = Math.round(lastSeen.getTime() / 1000)
    // const userStore = useUserStore()
    // userStore.setLastSeen(secondsSinceEpoch)
    // Follow redirect
    if (Math.floor(response?.status / 100) === 3) {
      if (response?.headers?.location) {
        window.location.href = response.headers.location
      }
      const encodedURL = encodeURI(requestParams.url.split('?')[0])
      if (response?.request?.responseURL && !response.request.responseURL.includes(encodedURL)) {
        window.location.href = response.request.responseURL
      }
    }
    // Toast message
    if (requestParams.successMessage) {
      Utils.toast(requestParams.successMessage, 'is-success', requestParams.undoFunction)
    }
    // Update commit counters
    if (requestParams.methodName !== 'GET' && !requestParams.skipIncreaseCommitsCounterOnSuccess) {
      const branchesStore = useBranchesStore()
      branchesStore.increaseCommitsCounter()
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
