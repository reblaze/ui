import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import _ from 'lodash'

export const useIdleStore = defineStore('idle', () => {

  // Data
  const _isIdle = ref(false)
  const _intervalId = ref(null)

  // Computed
  const isIdle = computed((): boolean => {
    return _isIdle.value
  })

  // Methods
  function trackIdleStateStart() {
    // TODO: Add (configurable?) idle cookie name
    const idleCookieName = 'userIdle' + '='
    // TODO: Interval time should be configurable instead of 10sec
    _intervalId.value = setInterval(() => {
      const decodedCookie = decodeURIComponent(document.cookie)
      const decodedCookieSplit = decodedCookie.split(';')
      const idleCookieValue = _.find(decodedCookieSplit, (cookie) => {
        while (cookie.charAt(0) == ' ') {
          cookie = cookie.substring(1)
        }
        if (cookie.indexOf(idleCookieName) == 0) {
          return cookie.substring(idleCookieName.length, idleCookieName.length)
        }
      })
      // TODO: Check if idleCookieValue is too old (configurable) and set `isIdle` accordingly instead of console.log
      console.log(idleCookieValue)
    }, 10 * 1000)
  }

  function trackIdleStateStop() {
    clearInterval(_intervalId)
  }

  return {
    isIdle,
    trackIdleStateStart,
    trackIdleStateStop,
  }
})
