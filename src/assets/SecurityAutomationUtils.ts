/* Rate Limit Threshold Recommendation */
import {RateLimit} from '@/types'
import axios from 'axios'
import _ from 'lodash'

const _xsrf = () => {
  // cookies.get('_xsrf'),
  return ''
}

const securityAutomation = {
  REQUEST_TIMEOUT: 5000,
  INTERVAL_TIME: 1000,
}

const consts = {
  NOT_FOUND: 'null',
}

const recommendRateLimitThreshold = async (rateLimit: RateLimit, siteName: string, path: string) => {
  // Calculate and serialize start date (today minus 1 week)
  const midnight = new Date().setUTCHours(0, 0, 0, 0)
  const startDate = new Date(midnight)
  startDate.setDate(startDate.getDate() - 7)
  const startDateISO = startDate.toISOString()
  // Calculate and serialize end date
  const endDate = new Date(midnight)
  const endDateISO = endDate.toISOString()
  // Serialize rate limit keys
  const keyPairList = _.map(rateLimit.key, (keyPair) => {
    const key = Object.keys(keyPair)[0]
    const value = Object.values(keyPair)[0]
    if (key === 'attrs') {
      return value
    }
    return `${key}.${value}`
  })
  // Serialize rate limit pair with
  let pairWith = ''
  const pairWithKey = Object.keys(rateLimit.pairwith)[0]
  const pairWithValue = Object.values(rateLimit.pairwith)[0] as string
  if (pairWithKey === 'self') {
    pairWith = `recid`
  } else if (pairWithKey === 'attrs') {
    pairWith = pairWithValue
  } else {
    pairWith = `${pairWithKey}.${pairWithValue}`
  }
  // Serialize rate limit tags from Include / Exclude
  // const includeTags = rateLimit.include?.attrs?.tag ? [rateLimit.include.attrs.tag] : []
  // const excludeTags = rateLimit.exclude?.attrs?.tag ? [rateLimit.exclude.attrs.tag] : []
  const includeTags = rateLimit.include ? [rateLimit.include] : []
  const excludeTags = rateLimit.exclude ? [rateLimit.exclude] : []
  // Get Domains list from site
  const sitesData = (await axios.get('/new-proxy-api')).data
  const currentSite = sitesData.sites.find((site: any) => {
    return site.canonical_name === siteName
  })
  // Build data object
  const requestData = {
    start_date: startDateISO,
    end_date: endDateISO,
    domain_names: currentSite.server_names,
    matching_path: path,
    // timeframe: Number(rateLimit.ttl),
    keys_list: keyPairList,
    include: includeTags,
    exclude: excludeTags,
    unique_value_to_count: pairWith,
  }
  return new Promise(((resolve, reject) => {
    axios.post(`/data-analysis/rlr?_xsrf=${_xsrf()}`, requestData)
      .then(async (response) => {
        const requestId = response.data.request_id
        const status = response?.data?.status
        if (status === 'done') {
          const response = await axios.get(`/data-analysis/rlr/${requestId}`)
          resolve(response.data)
        } else {
          pullRecommendedThreshold(resolve, reject, requestId) // rateLimit.id)
        }
      })
      .catch((error) => {
        reject(error)
      })
  }))
}

const pullRecommendedThreshold = (resolve: any, reject: any, requestId: string) => {
  let requestRunning = false
  const intervalFunc = async () => {
    if (requestRunning) {
      return
    }
    requestRunning = true
    axios.get(`/data-analysis/rlr/${requestId}?status_only=true`,
    {timeout: securityAutomation.REQUEST_TIMEOUT})
      .then(async (response) => {
        const status = response?.data?.status
        if (status === 'done') {
          clearInterval(interval)
          const response = await axios.get(`/data-analysis/rlr/${requestId}`)
          resolve(response.data)
        }
        requestRunning = false
      })
      .catch((error) => {
        if (error.status !== consts.NOT_FOUND) {
          clearInterval(interval)
          reject(error)
        }
        requestRunning = false
      })
  }
  intervalFunc()
  const interval = setInterval(() => {
    intervalFunc()
  }, securityAutomation.INTERVAL_TIME)
}

/* WAF False Positive Detection */

const getProfiles = async () => {
  const PLANET = `{{page_data['planet']}}`
  return new Promise(((resolve, reject) => {
    axios.post(`/planet/profiles/get?_xsrf=${_xsrf()}&planet=${PLANET}&action=get`)
      .then(async (response) => {
        resolve(response?.data?.security_profile)
      })
      .catch((error) => {
        reject(error)
      })
  }))
}

const updateProfiles = (profiles: any) => {
  const PLANET = `{{page_data['planet']}}`
  profiles = profiles.filter((securityProfile:any) => !securityProfile.managed)
  profiles = btoa(JSON.stringify(profiles))
  const jsonToUrl = (jsonData:any) => Object.entries(jsonData).map((x) =>
    `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1] as string)}`).join('&')
  axios.post(`/planet/profiles`, jsonToUrl({
    '_xsrf': _xsrf(),
    'planet': PLANET,
    'data': profiles,
    'action': 'set',
  }))
}

const recommendWAFFalsePositiveSignatures = async () => {
  return new Promise(((resolve, reject) => {
    axios.get(`/data-analysis/fp/signatures`)
      .then(async (response) => {
        const results = response?.data?.results
        resolve(results)
      })
      .catch((error) => {
        reject(error)
      })
  }))
}

const recommendWAFFalsePositiveEvents = async (signature: string) => {
  return new Promise(((resolve, reject) => {
    axios.get(`/data-analysis/fp/events?signature_id=${signature}`)
      .then(async (response) => {
        const results = response?.data?.results
        resolve(results)
      })
      .catch((error) => {
        reject(error)
      })
  }))
}

const recommendWAFFalsePositiveVectors = async (signature: string, uri: string) => {
  return new Promise(((resolve, reject) => {
    axios.get(`/data-analysis/fp/vectors?signature_id=${signature}&uri=${uri}`)
      .then(async (response) => {
        const results = response?.data?.results
        resolve(results)
      })
      .catch((error) => {
        reject(error)
      })
  }))
}


export default {
  name: 'SecurityAutomationUtils',
  recommendRateLimitThreshold,
  getProfiles,
  updateProfiles,
  recommendWAFFalsePositiveSignatures,
  recommendWAFFalsePositiveEvents,
  recommendWAFFalsePositiveVectors,
}
