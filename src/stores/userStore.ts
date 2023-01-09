import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import _ from 'lodash'
import Utils from '@/assets/Utils'
import {GenericObject} from '@/types'

const accessLevelReblazeEventsViewer = 'reblaze-events-viewer'
const accessLevelReblazeConfigViewer = 'reblaze-config-viewer'
const accessLevelReblazeConfigEditor = 'reblaze-config-editor'

export const useUserStore = defineStore('user', () => {
  // Data
  const _cookieName = ref('raj-token')
  const _accessLevels = ref({
    reblazeEventsViewer: accessLevelReblazeEventsViewer,
    reblazeConfigViewer: accessLevelReblazeConfigViewer,
    reblazeConfigEditor: accessLevelReblazeConfigEditor,
    reblazeUser: [
      accessLevelReblazeEventsViewer,
      accessLevelReblazeConfigViewer,
      accessLevelReblazeConfigEditor,
    ],
  })

  // Computed
  const accessLevels = computed((): GenericObject => {
    return _accessLevels.value
  })

  // Methods
  function getUserCookieValue() {
    const decodedCookie: string = decodeURIComponent(document.cookie)
    const decodedCookieSplit: string[] = decodedCookie?.split(';') || []
    let userCookie: string
    _.some(decodedCookieSplit, (cookie) => {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1)
      }
      if (cookie.startsWith(`${_cookieName.value}=`)) {
        userCookie = cookie.substring(_cookieName.value.length, cookie.length)
        return true
      }
    })
    return Utils.parseJwt(userCookie?.split('=')?.[1])
  }

  function checkAccessLevel(accessLevels: string[]) {
    const userCookieValue = getUserCookieValue()
    const userHasAccessLevel = userCookieValue.groups?.some((group: string) => {
      return accessLevels.includes(group)
    })
    const devMode = process.env.NODE_ENV === 'development'
    return !!userHasAccessLevel || !!devMode
  }

  return {
    accessLevels,
    checkAccessLevel,
  }
})
