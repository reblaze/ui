<template>
  <div class="modal is-active">
    <div class="modal-background">
      <div class="modal-card delete-modal">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0">
            Remove certificate
          </h5>
          <button class="close-modal delete"
                  aria-label="close"
                  @click="$emit('close-modal')"/>
        </header>
        <section class="modal-card-body is-size-6 has-text-centered">
          <p class="is-small is-size-6 certificate-name">
            Are you sure you want to remove certificate <br>
            <strong>{{ certificate?.name }}</strong>?
          </p>
          <p v-if="attachedApps?.length > 1"
             class="is-small is-size-6 mt-2">
             This certificate is already attached to apps:
             <ul>
              <li v-for="attachedApp in attachedApps"
                  :key="attachedApp"
                  class="attached-apps">
                <strong>{{attachedApp}}</strong>
              </li>
            </ul>
          </p>
          <p v-else-if="attachedApps?.length"
            class="is-small is-size-6 mt-2">
            This certificate is already attached to app <strong>{{attachedApps[0]}}</strong>
          </p>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right is-fullwidth">
            <button class="button is-small"
                    @click="$emit('close-modal')">
              Cancel
            </button>
            <button class="button is-small is-light is-outlined is-danger delete-button"
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
import {Certificate} from '@/types'
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  props: {
    certificate: Object as PropType<Certificate>,
    selectedBranch: String,
    attachedApps: Array as PropType<string[]>,
  },

  emits: ['close-modal', 'call-load-certificate'],

  data() {
    return {
      isLoading: false,
      titles: DatasetsUtils.titles,
    }
  },
  methods: {
    async deleteCertificate() {
      const certificateText = this.titles['certificates-singular']
      const url = `configs/${this.selectedBranch}/d/certificates/e/${this.certificate.id}/`
      const successMessage = `The ${certificateText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${certificateText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.$emit('call-load-certificate')
      this.$emit('close-modal')
    },
  },
})
</script>
