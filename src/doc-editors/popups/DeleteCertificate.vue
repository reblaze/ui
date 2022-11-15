<template>
<div class="modal is-active">
    <div class="modal-background">
        <div class="modal-card modal-location">
            <header class="modal-card-head">
                <h5 class="modal-card-title is-size-6 mb-0">Remove certificate</h5>
                <button class="delete" aria-label="close" @click="$emit('deleteShownChanged', false)"></button>
            </header>
            <section class="modal-card-body is-size-6 has-text-centered">
                <p class="is-small is-size-6">
                    Are you sure you want to remove certificate<br />
                    <strong>{{ clickedRow }}</strong>?
                </p>
                <p
                    v-if="attachedApps"
                    class="is-small is-size-6 mt-2"
                    v-html="attachedApps"
                ></p>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons is-right is-fullwidth">
                    <button class="button is-small" @click="$emit('deleteShownChanged', false)">
                        Cancel
                    </button>
                    <button
                        class="button is-small is-light is-outlined is-danger"
                        :class="{'is-loading': isLoading}"
                        @click="deleteCertificate()">
                        Delete
                    </button>
                </div>
            </footer>
        </div>
    </div>
</div>
</template>
<script lang="ts">
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {defineComponent} from 'vue'
// import RequestsUtils from '@/assets/RequestsUtils'
export default defineComponent({
  props: {
    deleteShown: Boolean,
    clickedRow: String,
    selectedBranch: String,
  },

  emits: ['deleteShownChanged', 'callLoadCertificate'],

  data() {
    return {
      attachedApps: '',
      isLoading: false,
      titles: DatasetsUtils.titles,
    }
  },

  methods: {
    async deleteCertificate() {
      const certificateText = this.titles['certificate-singular']
      const url = `configs/${this.selectedBranch}/d/certificates/e/${this.clickedRow}/`
      const successMessage = `The ${certificateText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${certificateText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.$emit('callLoadCertificate')
      this.$emit('deleteShownChanged', false)
    },
  },
})
</script>
<style scoped lang="scss">
.modal-location {
  margin-bottom: 8px;
  margin-top: -5px;
}

.modal-card {
  border-radius: 6px;
  top: 2%;
}

.buttons.is-fullwidth {
  width: 100%;
}
</style>
