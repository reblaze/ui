import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosError, AxiosResponse} from 'axios'

export const useIdleStore = defineStore('idle', () => {

  // Data
  const _isIdle = ref(false)
  const _intervalId = ref(null)
  const _intervalTime = ref(1)
  const _cookieName = ref('user_last_access_timestamp')
  const _reminderIdleTime = ref(5) // Default: 55 minutes. Must be lower than _maxIdleTime
  const _maxIdleTime = ref(100) // Default: 60 minutes

  // Computed
  const isIdle = computed((): boolean => {
    return _isIdle.value
  })

  const reminderIdleTime = computed((): number => {
    return _reminderIdleTime.value
  })

  const maxIdleTime = computed((): number => {
    return _maxIdleTime.value
  })

  // Methods
  function getLastSeenTime() {
    // Cannot be a computed value as cookies are not reactive
    const decodedCookie: string = decodeURIComponent(document.cookie)
    const decodedCookieSplit: string[] = decodedCookie.split(';')
    let idleCookieValue: string
    _.some(decodedCookieSplit, (cookie) => {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1)
      }
      if (cookie.indexOf(_cookieName.value) === 0) {
        idleCookieValue = cookie.substring(_cookieName.value.length, cookie.length)
        return true
      }
    })
    // TODO: Transform timestamp to 'seconds'(time) if needed
    return Number(idleCookieValue.split('=')[1])
  }

  function getCurrentIdleTime() {
    // Cannot be a computed value as both cookies and Date are not reactive
    const lastSeenTime = getLastSeenTime()
    if (!lastSeenTime) {
      return 0
    }
    const now = new Date()
    const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    return secondsSinceEpoch - lastSeenTime
  }

  function loadConfiguration() {
    return RequestsUtils.sendRequest({
      methodName: 'GET',
      url: 'db/system/k/idle/',
    }).then((response: AxiosResponse) => {
      const newValue = response?.data
      if (newValue) {
        _intervalTime.value = newValue.intervalTime
        _cookieName.value = newValue.cookieName
        _reminderIdleTime.value = newValue.reminderIdleTime
        _maxIdleTime.value = newValue.maxIdleTime
      }
    }).catch((err: AxiosError) => {
      console.log('Error while attempting to load idle configuration')
      console.log(err)
    })
  }

  async function trackIdleStateStart() {
    await loadConfiguration()
    _intervalId.value = setInterval(() => {
      const currentIdleTime = getCurrentIdleTime()
      _isIdle.value = currentIdleTime >= _reminderIdleTime.value
      // TODO: Force logout (?)
    }, _intervalTime.value * 1000)
  }

  function trackIdleStateStop() {
    clearInterval(_intervalId)
  }

  return {
    isIdle,
    reminderIdleTime,
    maxIdleTime,
    getCurrentIdleTime,
    trackIdleStateStart,
    trackIdleStateStop,
  }
})
