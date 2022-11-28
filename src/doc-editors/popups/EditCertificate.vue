<template>
  <div class="modal is-active is-large">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title is-size-6 mb-0"
            :title="clickedRow">
            Edit certificate - {{ clickedRow }}
          </h5>
          <button class="delete"
            aria-label="close"
            @click="resetEditModal"/>
        </header>
        <section class="modal-card-body">
          <div v-if="getConnectedSitesForEditCert"
            class="control content is-small mb-2">
            Connected sites:
            <input :value="getConnectedSitesForEditCert"
              class="input is-small"
              :title="getConnectedSitesForEditCert"
              type="text"
              disabled>
          </div>
          <div class="control content is-small mb-2">
            Certificate subject:
            <input :value="localCert.subject"
              class="input is-small"
              :title="localCert.subject"
              type="text"
              disabled>
          </div>
          <div class="control content is-small mb-2">
            Certificate issuer:
            <input :value="localCert.issuer"
              class="input is-small"
              :title="localCert.issuer"
              type="text"
              disabled>
          </div>
          <div class="control content is-small mb-2">
            SAN:
            <input :value="localCert.san.toString()"
              class="input is-small"
              :title="localCert.san.toString()"
              type="text"
              disabled>
          </div>
          <div class="control content is-small mb-2">
            Certificate body:
            <textarea v-html="localCert.cert_body"
              class="textarea is-small cert-body"
              disabled/>
          </div>
          <div v-if="certCanReplaceByLE"
            class="control content is-small mb-0 mt-4">
            <label class="checkbox is-align-items-center is-inline-flex">
              <input type="checkbox"
                v-model="localCert.le_auto_replace"
                @change="updateLetsEncrypt = !updateLetsEncrypt"
                class="mr-1">
              Auto Replacement by&nbsp;
              <a href="https://letsencrypt.org"
                target="_blank">
              Let's Encrypt
              </a>
            </label>
          </div>
          <div class="tabs is-small">
            <ul class="ml-0">
              <li @click="certAction='attach_to_application'"
                :class="{'is-active': isAttachSelectedOnEdit}">
                <a>Attach to application</a>
              </li>
              <li @click="certAction='replace_certificate'"
                :class="{'is-active': isReplaceSelectedOnEdit}">
                <a>Replace existing certificates</a>
              </li>
            </ul>
          </div>
          <div class="edit-cert-action-container">
            <div v-if="isAttachSelectedOnEdit">
              <div class="field">
                <div class="is-size-7 pl-1">
                  {{ selectedAppsLabel }}
                </div>
                <select v-model="selectedApps"
                  class="selected"
                  multiple
                  title="Select links"
                  :loading="isLoading"
                  :option-height="10">
                  <option v-for="site in sites"
                    :key="site.id"
                    :value="site">
                    {{ site.name }}
                  </option>
                </select>
              </div>
            </div>
            <div v-if="isReplaceSelectedOnEdit">
              <div class="field">
                <div class="control">
                  <div class="select is-small">
                    <select v-model="selectedCertId"
                      class="selected"
                      id="selectCert">
                      <option value=""
                        disabled
                        key="no_value">
                        {{ assignedCertsNamesExceptCurrent.length ? 'Select certificate' : '-- No certificates to replace --' }}
                      </option>
                      <option v-for="(certId, index) in assignedCertsNamesExceptCurrent"
                        :value="certId"
                        :key="index">
                        {{ certId }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot columns">
          <div class="column is-9">
            <button class="button is-light has-text-info is-small"
              type="submit"
              @click="downloadPFX">
              Download PFX
            </button>
          </div>
          <div class="column is-3 has-text-right">
            <button class="button is-small"
              @click="resetEditModal"
              v-if="!isLoading">
              Cancel
            </button>
            <button @click="saveChanges"
              :disabled="isSaveEditDisabled"
              class="button is-small"
              :class="{ 'is-loading': isLoading }">
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {Balancer, Certificate, Site} from '@/types'
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'
export default defineComponent({
  props: {
    clickedRow: String,
    certificate: Object,
    loadBalancer: Object,
    sites: Array as PropType<Site[]>,
    selectedBranch: String,
    balancers: Array as PropType<Balancer[]>,
  },

  emits: ['edit-shown-changed', 'call-load-certificate'],

  watch: {
    assignedApps: {
      handler: function(val) {
        this.selectedApps = _.cloneDeep(val)
      },
      deep: true,
      immediate: true,
    },
  },

  data() {
    return {
      CERT_FIELDS_LABELS: {
        subject: 'Certificate subject:',
        issuer: 'Certificate issuer:',
        san: 'SAN:',
        cert_body: 'Certificate body:',
      },
      cert: '',
      selectedApps: [] as Site[],
      selectedCertId: '',
      certAction: 'attach_to_application',
      isLoading: false,
      updateLetsEncrypt: false,
      cnamesForSelect: [],
      searchMultiselect: '',
      multiselectOpen: false,
      headerResponse: {},
    }
  },
  computed: {
    localCert(): Certificate {
      return _.cloneDeep(this.certificate as Certificate)
    },

    isAttachSelectedOnEdit() {
      return this.certAction === 'attach_to_application'
    },

    isReplaceSelectedOnEdit() {
      return this.certAction === 'replace_certificate'
    },

    isSaveEditDisabled() {
      return !this.updateLetsEncrypt && !this.isActiveEditOptionChanged
    },

    isActiveEditOptionChanged() {
      const isAttachChanged = (_.differenceBy(this.selectedApps, this.assignedApps, 'id').length > 0) || (_.differenceBy(this.assignedApps, this.selectedApps, 'id').length > 0)
      const isAttachActiveAndChanged = this.isAttachSelectedOnEdit && isAttachChanged
      const isReplaceActiveAndChanged = this.isReplaceSelectedOnEdit && this.selectedCertId
      return isAttachActiveAndChanged || isReplaceActiveAndChanged
    },

    selectedAppsLabel() {
      const selectedLen = this.selectedApps.length
      const s = selectedLen === 1 ? '' : 's'
      return selectedLen + ' app' + s + ' selected'
    },

    sitesByCertNameMap() {
      const returnValue : {[key: string]: string[]} = {}
      this.sites?.forEach((site: Site) => {
        const certId = site.ssl_certificate
        if (certId) {
          if (!returnValue[certId]) {
            returnValue[certId] = []
          }
          returnValue[certId].push(site.name)
        }
      })
      return returnValue
    },

    assignedCertsNames() {
      const certs = new Set(Object.keys(this.sitesByCertNameMap))
      this.balancers.forEach((balancer: Balancer) => {
        balancer.certificates.forEach((link: string) => {
          certs.add(this.findLocalCertificateNameWithLink(link))
        })
      })
      return [...certs]
    },

    assignedCertsNamesExceptCurrent() {
      return this.assignedCertsNames.filter((cert) => cert !== this.localCert.id)
    },

    certCanReplaceByLE():any {
      return !this.localCert.san || !this.localCert.san.toString().includes('*')
    },

    getConnectedSitesForEditCert():string {
      if (this.sitesByCertNameMap[this.localCert.id]) {
        return this.sitesByCertNameMap[this.localCert.id].join(' , ')
      }
      return ''
    },

    assignedApps(): Site[] {
      return _.filter(this.sites, (site: Site) => {
        return site?.ssl_certificate === this.localCert.id
      })
    },
  },
  methods: {
    resetEditModal() {
      this.$emit('edit-shown-changed', false)
      this.cert = ''
      this.selectedApps = []
      this.selectedCertId = ''
      this.certAction = 'attach_to_application'
    },

    // TODO: add type to providerLink as loadbalancer[links.provider]
    findLocalCertificateNameWithLink(providerLink:any): string {
      const gcpLink = _.find(this.certificate.links, (link) => {
        return link.provider === 'gcp'
      })
      if (gcpLink?.link === providerLink) {
        return this.certificate.id
      }
      const awsLink = _.find(this.certificate.links, (link) => {
        return link.provider === 'aws'
      })
      if (awsLink?.link === providerLink) {
        return this.certificate.id
      }
      const defaultCertName = providerLink.split('/')
      return defaultCertName[defaultCertName.length - 1] + '(*)'
    },

    async downloadPFX() {
      const url = `configs/${this.selectedBranch}/d/certificates/e/${this.localCert.id}/pfx/`
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: url,
        config: {responseType: 'blob'},
      })
      Utils.downloadFile('certificate', 'pfx', response.data)
    },

    async saveChanges() {
      const sitesToRemove = _.differenceBy(this.assignedApps, this.selectedApps, 'id')
      const sitesToAdd = _.differenceBy(this.selectedApps, this.assignedApps, 'id')
      const methodName = 'PUT'
      sitesToRemove.forEach(async (site: Site) => {
        const url = `configs/${this.selectedBranch}/d/sites/e/${site.id}/`
        site.ssl_certificate = ''
        await RequestsUtils.sendReblazeRequest({methodName: methodName, url, data: site})
      })
      sitesToAdd.forEach(async (site: Site) => {
        const url = `configs/${this.selectedBranch}/d/sites/e/${site.id}/`
        site.ssl_certificate = this.localCert.id
        await RequestsUtils.sendReblazeRequest({methodName: methodName, url, data: site})
      })
      const urlArgs = `?le_auto_renew=${this.localCert.le_auto_renew}&le_auto_replace=${this.localCert.le_auto_replace}`
      const url = `configs/${this.selectedBranch}/d/certificates/e/${this.localCert.id}${urlArgs}`
      const data = this.localCert
      await RequestsUtils.sendReblazeRequest({methodName: methodName, url, data})
      this.$emit('edit-shown-changed', false)
      this.$emit('call-load-certificate')
    },
  },
})
</script>
<style scoped lang="scss">
.selected {
  width: 400px;
}
</style>
