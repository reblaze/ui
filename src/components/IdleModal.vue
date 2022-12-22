<template>
  <div class="modal is-active is-large">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0">
            Your session is about to expire
          </h5>
        </header>
        <section class="modal-card-body">
          <div class="modal-content">
            <!--TODO: Idle message, singular minute maxIdleTime-->
            You've been idle for more than {{ maxIdleTime / 60 }} minutes.
            {{ remainingTimeClock }} left before you'll be forcefully logged out.
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
      // TODO: these 2 variables should be configurable in System DB
      remainingTime: 60, // seconds
      maxIdleTime: 600, // seconds
    }
  },
  computed: {
    remainingTimeClock(): string[] {
      const remainingMinutes = Math.floor(this.remainingTime / 60)
      const remainingSeconds = this.remainingTime % 60
      const formattedRemainingMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
      const formattedRemainingSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
      return `${formattedRemainingMinutes}:${formattedRemainingSeconds}`
    },

    isIdle(): boolean {
      return this.idleStore.isIdle
    },

    ...mapStores(useIdleStore),
  },
  mounted() {
    this.timerId = setInterval(() => {
      this.remainingTime -= 1
      if (!this.isIdle) {
        // TODO: Update server on idle status
        clearInterval(this.timerId)
      }

      if (this.remainingTime < 1) {
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
