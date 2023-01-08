import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosError, AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'

export const useUserStore = defineStore('user', () => {
  // Data
  const _cookieName = ref('raj-token')
  const _lastSeen = ref(null)
  const _isIdle = ref(false)
  const _idleIntervalId = ref(null)
  const _idleIntervalTime = ref(1)
  const _idleReminderTime = ref(50 * 60) // Default: 50 minutes

  // Computed
  const isIdle = computed((): boolean => {
    return _isIdle.value
  })

  const lastSeen = computed((): number => {
    return _lastSeen.value
  })

  const idleReminderTime = computed((): number => {
    return _idleReminderTime.value
  })

  // Methods
  function loadConfiguration() {
    return RequestsUtils.sendRequest({
      methodName: 'GET',
      url: 'db/system/k/user/',
    }).then((response: AxiosResponse) => {
      const newValue = response?.data
      if (newValue) {
        _cookieName.value = newValue.cookieName
        _idleIntervalTime.value = newValue.idleIntervalTime
        _idleReminderTime.value = newValue.idleReminderTime
      }
    }).catch((err: AxiosError) => {
      console.log('Error while attempting to load user configuration')
      console.log(err)
    })
  }

  function getUserCookieValue() {
    const decodedCookie: string = decodeURIComponent(document.cookie)
    const decodedCookieSplit: string[] = decodedCookie?.split(';') || []
    let userCookie: string
    _.some(decodedCookieSplit, (cookie) => {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1)
      }
      if (cookie.indexOf(_cookieName.value) === 0) {
        userCookie = cookie.substring(_cookieName.value.length, cookie.length)
        return true
      }
    })
    return Utils.parseJwt(userCookie?.split('=')?.[1])
  }

  function getCookieExpirationTime() {
    // Cannot be a computed value as cookies are not reactive
    const userCookieValue = getUserCookieValue()
    return Number(userCookieValue.exp)
  }

  function getCurrentIdleTime() {
    // Cannot be a computed value as both cookies and Date are not reactive
    if (!lastSeen.value) {
      return 0
    }
    const now = new Date()
    const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    return secondsSinceEpoch - lastSeen.value
  }

  function setLastSeen(value: number) {
    _lastSeen.value = value
  }

  async function trackIdleStateStart() {
    await loadConfiguration()
    _idleIntervalId.value = setInterval(() => {
      const currentIdleTime = getCurrentIdleTime()
      _isIdle.value = currentIdleTime >= _idleReminderTime.value
      // TODO: Force logout (?)
    }, _idleIntervalTime.value * 1000)
  }

  function trackIdleStateStop() {
    clearInterval(_idleIntervalId)
  }

  return {
    isIdle,
    lastSeen,
    idleReminderTime,
    getCookieExpirationTime,
    getCurrentIdleTime,
    setLastSeen,
    trackIdleStateStart,
    trackIdleStateStop,
  }
})
