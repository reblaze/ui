<template>
  <div class="modal is-active">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0">
            <span v-if="idleRemainingTime > 0">
              Your session is about to expire
            </span>
            <span v-else>
              Your session has expired!
            </span>
          </h5>
        </header>
        <section class="modal-card-body">
          <template v-if="idleRemainingTime > 0">
            <p>
              You've been idle for more than {{ idleReminderTimeString }}.
            </p>
            <p>
              Time left before the session expires:
              <span class="has-text-weight-bold">
                {{ idleRemainingTimeClock }}
              </span>
            </p>
          </template>
          <template v-else>
            <p>
              Please login to the system again to continue working.
            </p>
          </template>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right is-fullwidth">
            <!--TODO: Add actual meaningful buttons-->
            <template v-if="idleRemainingTime > 0">
              <button class="button is-small">
                Refresh Session
              </button>
            </template>
            <template v-else>
              <button class="button is-small">
                Login
              </button>
            </template>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {mapStores} from 'pinia'
import {useUserStore} from '@/stores/userStore'

export default defineComponent({
  name: 'IdleModal',
  data() {
    return {
      timerId: null,
      cookieExpirationTime: 0,
      idleRemainingTime: 0,
    }
  },
  computed: {
    isIdle(): boolean {
      return this.userStore.isIdle
    },

    idleReminderTime(): number {
      return this.userStore.idleReminderTime
    },

    idleReminderTimeString(): string {
      let stringValue = ''
      const minutes = Math.floor(this.idleReminderTime / 60)
      if (minutes) {
        stringValue += `${minutes} minute`
        if (minutes > 1) {
          stringValue += 's'
        }
      }
      const seconds = this.idleReminderTime % 60
      if (seconds) {
        if (stringValue) {
          stringValue += ' '
        }
        stringValue += `${seconds} second`
        if (seconds > 1) {
          stringValue += 's'
        }
      }
      return stringValue
    },

    idleRemainingTimeClock(): string {
      const idleRemainingTime = this.idleRemainingTime
      const remainingMinutes = Math.floor(idleRemainingTime / 60)
      const remainingSeconds = idleRemainingTime % 60
      const formattedRemainingMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
      const formattedRemainingSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
      return `${formattedRemainingMinutes}:${formattedRemainingSeconds}`
    },

    ...mapStores(useUserStore),
  },
  methods: {
    refreshClock() {
      this.cookieExpirationTime = this.userStore.getCookieExpirationTime()
      const now = new Date()
      const secondsSinceEpoch = Math.round(now.getTime() / 1000)
      this.idleRemainingTime = this.cookieExpirationTime - secondsSinceEpoch

      if (!this.isIdle) {
        // TODO: Update server on idle status
        clearInterval(this.timerId)
      }

      if (this.idleRemainingTime <= 0) {
        clearInterval(this.timerId)
      }
    },
  },
  mounted() {
    this.timerId = setInterval(() => {
      this.refreshClock()
    }, 1000)
    this.refreshClock()
  },
})
</script>
<style scoped
       lang="scss">
</style>
