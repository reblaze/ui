<template>
  <div class="modal is-active is-large">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0">
            Generate certificate
          </h5>
          <button
            class="delete"
            aria-label="close"
            @click="closeAndResetUploadModal"
          />
        </header>
        <section class="modal-card-body">
          <!-- <loader v-if="is_loading"></loader> -->
          <div class="tile is-3">
            <div class="control modal-location">
              <label
                for="manual"
                class="radio is-size-7"
              >
                <input
                  type="radio"
                  name="isManualInput"
                  id="manual"
                  :value="true"
                  v-model="isManualInput"
                  @change="inputTypeChagned"
                >
                Manual input
              </label>
              <br>
              <label
                for="extract"
                class="radio is-size-7"
              >
                <input
                  type="radio"
                  name="isManualInput"
                  id="extract"
                  :value="false"
                  v-model="isManualInput"
                  @change="inputTypeChagned"
                >
                Extract pfx file
              </label>
            </div>
          </div>
          <div v-if="isManualInput">
            <h3 class="is-size-7 man-input-title">
              Input Certificate Manually
            </h3>
            <hr>
          </div>
          <div v-else>
            <h3 class="is-size-7 pb-2">
              Extract Certificate From File
            </h3>
            <div class="field has-addons-right">
              <form>
                <div class="file has-name control is-small">
                  <label class="file-label">
                    <input
                      class="file-input"
                      type="file"
                      name="certFile"
                      @input="loadFile"
                      accept=".pfx"
                    >
                    <span class="file-cta">
                      <span class="file-icon">
                        <i class="fas fa-upload" />
                      </span>
                      <span class="file-label">
                        Choose a PFX file
                      </span>
                    </span>
                    <span class="file-name">
                      {{ certFile ? certFile.name : 'No file chosen' }}
                    </span>
                  </label>
                </div>
              </form>
            </div>
            <div
              class="field"
              v-show="certFile && !private_key"
            >
              <label class="label is-small">Password</label>
              <div class="control tile is-8">
                <input
                  class="input is-small"
                  ref="pfxPass"
                  type="text"
                  v-model="pfxPassword"
                >
                <button
                  @click="extractCertFile"
                  :disabled="isExtractDisabled || !pfxPassword"
                  class="button is-small is-info control ml-1"
                  :class="{ 'is-loading': isExtracting }"
                >
                  Extract file
                </button>
              </div>
              <p
                :style="{ visibility: isPasswordWarning ? 'visible' : 'hidden' }"
                class="help is-danger"
              >
                {{ passwordMessage }}
              </p>
            </div>
            <hr class="mt-3">
          </div>
          <div id="cert-parts">
            <div class="field">
              <label class="label is-small">Private key</label>
              <div class="control">
                <textarea
                  v-model="private_key"
                  class="textarea is-small"
                  :disabled="!isManualInput"
                  :placeholder="EMPTY_CERTIFICATE_KEY_FIELD"
                />
              </div>
            </div>
            <div class="field">
              <label class="label is-small">Certificate</label>
              <div class="control">
                <textarea
                  v-model="certificate"
                  class="textarea is-small certificate-data"
                  :placeholder="EMPTY_CERTIFICATE_FIELD"
                  rows="8"
                />
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right is-fullwidth">
            <button
              class="button is-small"
              @click="closeAndResetUploadModal"
            >
              Cancel
            </button>
            <button
              class="button is-small is-outlined"
              :class="{ 'is-loading': is_loading }"
              :disabled="isSaveNewCertDisabled"
              @click="uploadManualInputCert"
            >
              Save
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
import {defineComponent} from 'vue'

export default defineComponent({
  props: {
    selectedBranch: String,
  },

  emits: ['generate-shown-changed', 'call-load-certificate'],

  data() {
    return {
      EMPTY_CERTIFICATE_FIELD: '-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----',
      EMPTY_CERTIFICATE_KEY_FIELD: '--BEGIN PRIVATE KEY--\n--END PRIVATE KEY--',
      is_loading: false,
      private_key: '',
      certificate: '',
      certFile: null,
      password: '',
      passwordMessage: '',
      isExtracting: false,
      isManualInput: true,
      new_cert_name: '',
      titles: DatasetsUtils.titles,
    }
  },
  computed: {
    pfxPassword: {
      get() {
        return '•'.repeat(this.password.length)
      },
      set(value:any) {
        const newVal = value.replaceAll('•', '')
        const password = this.password.substr(0, value.length)
        this.passwordMessage = ''
        this.password = `${password}${newVal}`
      },
    },

    isExtractDisabled() {
      return this.certFile == null
    },

    isPasswordWarning() {
      return this.passwordMessage
    },

    isSaveNewCertDisabled() {
      return !this.private_key || !this.certificate
    },
  },
  methods: {
    removeFile() {
      this.certFile = null
      this.password = ''
    },

    resetInputs() {
      this.private_key = ''
      this.certificate = ''
      this.passwordMessage = ''
    },

    inputTypeChagned() {
      this.resetInputs()
      this.removeFile()
    },

    closeAndResetUploadModal() {
      this.$emit('generate-shown-changed', false)
      this.isManualInput = true
      this.resetInputs()
      this.removeFile()
    },

    loadFile({target}:any) {
      const file: File = target.files[0]
      const extension = file.name.split('.').pop()
      if (extension === 'pfx') {
        this.certFile = file
        this.resetInputs()
        this.$nextTick(() => this.$refs.pfxPass.focus())
      } else {
        target.value = null
      }
    },

    async extractCertFile() {
      if (this.certFile != null) {
        this.isExtracting = true
        const certText = this.titles['certificate-singular']
        const file = this.certFile
        const url = 'tools/certificates/extractpfx/'
        const formData = new FormData()
        formData.append('fileName', file, this.certFile.name)
        formData.append('password', this.password)
        const failureMessage = `Failed while attempting to extract the new ${certText} PFX file.`
        const response = await RequestsUtils.sendReblazeRequest({
          methodName: 'POST',
          url,
          data: formData,
          config: {headers: {'Content-Type': 'multipart/form-data'}},
          failureMessage,
        })
        this.private_key = response?.data.private_key
        this.certificate = response?.data.certificate_body
        this.isExtracting = false
      }
    },

    newManualCertificate(): Certificate {
      const factory = DatasetsUtils.newOperationEntryFactory['certificate']
      return factory && factory()
    },

    async uploadManualInputCert() {
      this.is_loading = true
      try {
        const manualCertificateToAdd = this.newManualCertificate()
        const siteText = this.titles['certificate-singular']
        const successMessage = `New ${siteText} was created.`
        const failureMessage = `Failed while attempting to create the new ${siteText}.`
        const url = `configs/${this.selectedBranch}/d/certificates/e/${manualCertificateToAdd.id}`
        manualCertificateToAdd['private_key'] = this.private_key
        manualCertificateToAdd['cert_body'] = this.certificate
        const data = manualCertificateToAdd
        await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage}).then(() => {
          this.$emit('generate-shown-changed', false)
          this.$emit('call-load-certificate')
        })
      } catch (err) {
        console.log(err)
      } finally {
        this.is_loading = false
      }
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
