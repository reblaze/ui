<template>
  <div class="modal is-active">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0">
            <span v-if="remainingIdleTime > 0">
              Your session is about to expire
            </span>
            <span v-else>
              Your session has expired!
            </span>
          </h5>
        </header>
        <section class="modal-card-body">
          <div class="modal-content">
            <template v-if="remainingIdleTime > 0">
              <p>
                You've been idle for more than {{ reminderIdleTimeString }}.
              </p>
              <p>
                Time left before you'll be forcefully logged out: {{ remainingIdleTimeClock }}
              </p>
            </template>
            <template v-else>
              <p>
                Please login to the system again to continue working.
              </p>
            </template>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right is-fullwidth">
            <!--TODO: Add actual meaningful buttons-->
            <button class="button is-small">
              Refresh Session
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {mapStores} from 'pinia'
import {useIdleStore} from '@/stores/IdleStore'

export default defineComponent({
  name: 'IdleModal',
  data() {
    return {
      timerId: null,
      currentIdleTime: 0,
    }
  },
  computed: {
    isIdle(): boolean {
      return this.idleStore.isIdle
    },

    reminderIdleTime(): number {
      return this.idleStore.reminderIdleTime
    },

    maxIdleTime(): number {
      return this.idleStore.maxIdleTime
    },

    reminderIdleTimeString(): string {
      let stringValue = ''
      const minutes = Math.floor(this.reminderIdleTime / 60)
      if (minutes) {
        stringValue += `${minutes} minute`
        if (minutes > 1) {
          stringValue += 's'
        }
      }
      const seconds = this.reminderIdleTime % 60
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

    remainingIdleTime(): number {
      return this.maxIdleTime - this.currentIdleTime
    },

    remainingIdleTimeClock(): string {
      const remainingIdleTime = this.remainingIdleTime
      const remainingMinutes = Math.floor(remainingIdleTime / 60)
      const remainingSeconds = remainingIdleTime % 60
      const formattedRemainingMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
      const formattedRemainingSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
      return `${formattedRemainingMinutes}:${formattedRemainingSeconds}`
    },

    ...mapStores(useIdleStore),
  },
  mounted() {
    this.timerId = setInterval(() => {
      this.currentIdleTime = this.idleStore.getCurrentIdleTime()

      if (!this.isIdle) {
        // TODO: Update server on idle status
        clearInterval(this.timerId)
      }

      if (this.remainingIdleTime <= 0) {
        clearInterval(this.timerId)
        // TODO: Insert logout function here instead of the alert
        alert('logout user....')
      }
    }, 1000)
  },
})
</script>
<style scoped
       lang="scss">
</style>
