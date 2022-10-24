<template>
<div class="modal is-active is-large" v-if="generateShown">
  <div class="modal-background">
    <div class="modal-card is-size-7">
          <header class="modal-card-head">
            <!-- TODO: ask Aviv about the h5 and h3 weight -->
              <h5 class="modal-card-title is-size-6 mb-0">Generate certificate</h5>
              <button class="delete" aria-label="close" @click="closeAndResetUploadModal"></button>
          </header>
          <section class="modal-card-body">
              <loader v-if="is_loading"></loader>
              <div class="tile is-3">
                  <div class="control modal-location">
                      <label for="manual" class="radio is-size-7">
                          <input
                              type="radio"
                              name="isManualInput"
                              id="manual"
                              :value="true"
                              v-model="isManualInput"
                              @change="inputTypeChagned"/>
                          Manual input
                      </label>
                      <br>
                      <label for="extract" class="radio is-size-7">
                          <input
                              type="radio"
                              name="isManualInput"
                              id="extract"
                              :value="false"
                              v-model="isManualInput"
                              @change="inputTypeChagned"/>
                          Extract pfx file
                      </label>
                  </div>
              </div>
              <div v-if="isManualInput">
                  <h3 class="is-size-7 man-input-title">Input Certificate Manually</h3>
                  <hr>
              </div>
              <div v-else>
                  <h3 class="is-size-7 pb-2">Extract Certificate From File</h3>
                  <div class="field has-addons-right">
                      <form>
                          <div class="file has-name control is-small">
                              <label class="file-label">
                                  <input
                                      class="file-input"
                                      type="file"
                                      name="certFile"
                                      @input="loadFile"
                                      accept=".pfx"/>
                                  <span class="file-cta">
                                      <span class="file-icon">
                                        <i class="fas fa-upload"></i>
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
                  <div class="field" v-show="certFile && !private_key">
                      <label class="label is-small">Password</label>
                      <div class="control tile is-8">
                          <input
                            class="input is-small"
                            ref="pfxPass"
                            type="text"
                            v-model="pfxPassword"/>
                          <button
                            @click="extractCertFile"
                            :disabled="isExtractDisabled || !pfxPassword"
                            class="button is-small is-info control ml-1"
                            :class="{ 'is-loading': isExtracting }">
                            Extract file
                          </button>
                      </div>
                      <p :style="{ visibility: isPasswordWarning ? 'visible' : 'hidden' }" class="help is-danger">
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
                            :placeholder="EMPTY_CERTIFICATE_KEY_FIELD">
                        </textarea>
                    </div>
                </div>
                <div class="field">
                    <label class="label is-small">Certificate</label>
                    <div class="control">
                      <textarea v-model="certificate"
                                class="textarea is-small certificate-data"
                                :placeholder="EMPTY_CERTIFICATE_FIELD"
                                rows="8">
                      </textarea>
                    </div>
                </div>
            </div>
        </section>
        <footer class="modal-card-foot">
            <div class="buttons is-right is-fullwidth">
                <button class="button is-small" @click="closeAndResetUploadModal">
                    Cancel
                </button>
                <button
                    class="button is-small is-outlined"
                    :class="{ 'is-loading': is_loading }"
                    :disabled="isSaveNewCertDisabled"
                    @click="uploadManualInputCert">
                    Save
                </button>
            </div>
        </footer>
        </div>
    </div>
</div>
</template>
<script lang="ts">
import axios from 'axios'
import {defineComponent} from 'vue'

export default defineComponent({
  props: {
    generateShown: Boolean,
  },
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
      this.$emit('generateShownChanged', false)
      this.isManualInput = true
      this.resetInputs()
      this.removeFile()
    },

    loadFile({target}:any) {
      const file = target.files[0]
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
        const file = this.certFile
        const fileName = this.certFile.name
        const formData = new FormData()
        formData.append('action', 'extract')
        formData.append('pfx_file', file, fileName)
        formData.append('pfx_password', this.password)
        try {
          // TODO: requestUtiles call
          const {data} = await axios({
            method: 'post',
            url: '/ssl-gcp',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'},
          })
          if (data.error) {
            if (data.error.includes('invalid password')) {
              if (!this.password) {
                this.passwordMessage = 'Please provide password for pfx file'
              } else {
                this.passwordMessage = 'Invalid password'
              }
            } else {
              throw new Error('Failed to extract certificate from file')
            }
          }
          // success
          this.private_key = data.private_key
          this.certificate = data.cert_body
          this.password = ''
        } catch (err) {
          console.log(err)
        } finally {
          this.isExtracting = false
        }
      }
    },

    async uploadManualInputCert() {
      this.is_loading = true
      // get cert key and body
      const data = {
        certKey: this.private_key,
        certBody: this.certificate,
        case: 'new_certificate',
      }
      const formData = new FormData()
      formData.append('action', 'upload_certificate')
      formData.append('data', btoa(JSON.stringify(data)))
      console.log(formData)
      try {
        /* TODO: const {data} = await axios({
          method: 'post',
          url: '/ssl-gcp',
          data: formData,
          headers: {'Content-Type': 'multipart/form-data'},
        })
        if (data.error) {
          const msg = typeof data.error === 'string' ? data.error : 'unable to upload certificate'
          throw new Error(msg)
        }*/
        // success
        this.new_cert_name = ''
        // TODO: emit the parent to load loadBalancers and loadCerteficates again
        this.$emit('callLoaders')
        this.closeAndResetUploadModal()
        // this.new_cert_name = data.new_cert_name
      } catch ({message}) {
        console.log(message)
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
