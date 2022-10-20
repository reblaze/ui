<template>
    <div class="modal is-active is-large" v-if="editShown">

        <div class="modal-background">

            <div class="modal-card is-size-7">

                <header class="modal-card-head">
                    <h5 class="modal-card-title is-size-6 mb-0" :title="clickedRow">
                        Edit certificate - {{ clickedRow }}
                    </h5>
                    <button class="delete" aria-label="close" @click="resetEditModal"></button>
                </header>
                <section class="modal-card-body">
                    <loader v-if="is_loading"></loader>
                    <div v-if="getConnectedSitesForEditCert" class="control content is-small mb-2">
                        Connected sites:
                        <input :value="getConnectedSitesForEditCert"
                               class="input is-small"
                               :title="getConnectedSitesForEditCert"
                               type="text"
                               disabled />
                    </div>
                    <!-- TODO: HERE (want to divide for static divs and introduce the correct field) -->
                    <!-- <div class="control content is-small mb-2">
                      <textarea
                        v-if="field === 'cert_body'"
                        v-html="cert"
                        class="textarea is-small cert-body"
                        disabled />
                    </div> -->
                    <div v-for="field in filteredCertFields()"
                         :key="field"
                         class="control content is-small mb-2">
                           <!-- {{ CERT_FIELDS_LABELS[field] }} --> <!-- TODO: check with Aviv wh got there error -->
                    <textarea
                        v-if="field === 'cert_body'"
                        v-html="cert"
                        class="textarea is-small cert-body"
                        disabled />
                        <!-- TODO: on the textarea instead v-html="cert" need to be v-html="cert[field]" -->
                        <!-- TODO: on the input instead :value="cert" and :title="cert" need to be :value="cert[field]" and :title="cert[field]" -->
                    <input
                        v-else
                        :value="cert"
                        class="input is-small"
                        :title="cert"
                        type="text"
                        disabled />
                    </div>
                    <div v-if="certCanReplaceByLE" class="control content is-small mb-0 mt-4">
                        <label class="checkbox is-align-items-center is-inline-flex">
                            <!-- TODO: instead v-model="test" need to be v-model="cert['le_auto_replace']" -->
                            <input
                                type="checkbox"
                                v-model="test"
                                @click="changeUpdateLE"
                                class="mr-1" />
                            Auto Replacement by&nbsp;
                            <a href="https://letsencrypt.org" target="_blank">Let's Encrypt</a>
                        </label>
                    </div>
                    <div class="tabs is-small">
                        <ul class="ml-0">
                            <li
                                @click="certAction='attach_to_application'"
                                :class="{'is-active': isAttachSelectedOnEdit}">
                                <a>Attach to application</a>
                            </li>
                            <li
                                @click="certAction='replace_certificate'"
                                :class="{'is-active': isReplaceSelectedOnEdit}">
                                <a>Replace existing certificates</a>
                            </li>
                            {#
                                <li
                                    @click="certAction='pem'"
                                    :class="{'is-active': isPem}">
                                    <a>PEM</a>
                                </li>
                            #}
                        </ul>
                    </div>
                    <div class="edit-cert-action-container">
                        <div v-if="isAttachSelectedOnEdit">
                            <div class="field">
                                <div class="is-size-7 pl-1">{{ selectedAppsLabel }}</div>
                                <multiselect
                                    :options="optionsMultiselect"
                                    @search-change="onSearchMultiselect"
                                    :internal-search="false"
                                    @open="openMultiselect"
                                    @close="closeMultiselect"
                                    :multiple="true"
                                    :loading="is_loading"
                                    :close-on-select="false"
                                    :clear-on-select="false"
                                    open-direction="bottom"
                                    placeholder="Search or select apps"
                                    select-label=""
                                    deselect-label=""
                                    selected-label=""
                                    :option-height="25"
                                    :max-height="220"
                                    style="width: 400px;"> <!-- TODO: need to move it to style section style="width: 400px;" -->
                                    <!-- <span class="option-wrapper" slot="option" slot-scope="scope">
                                        <span
                                            class="checkbox-label"
                                            @click="scope.option.checked = !scope.option.checked; changeOption(scope.option.checked, scope.option.label)">
                                            {{ scope.option.label }}
                                        </span>
                                        <input
                                            type="checkbox"
                                            :checked="scope.option.checked"
                                            @change="changeOption($event.target.checked, scope.option.label)" />
                                    </span> -->
                                    <span slot="noResult">No apps found</span>
                                    <span slot="noOptions">There are no apps to select</span>
                                </multiselect>
                            </div>
                        </div>
                        <div v-if="isReplaceSelectedOnEdit">
                            <div class="field">
                                <div class="control">
                                    <div class="select is-small">
                                        <select v-model="selectedCertId" id="selectCert" style="width: 400px;">
                                            <!-- TODO: add instead aaa the {{ assignedCertsNamesExceptCurrent.length ? 'Select certificate' : '-- No certificates to replace --' }} -->
                                            <option value='' disabled key='no_value'>
                                                aaaa
                                            </option>
                                            <option
                                                v-for="(index, certId) in assignedCertsNamesExceptCurrent"
                                                :value="certId"
                                                :key="certId">
                                                {{ certId }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="isPem">
                            <!-- TODO: need to add v-model="cert.cert_body" instead v-model="cert" -->
                            <textarea
                                    class="edit-pem"
                                    v-model="cert">
                            </textarea>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot columns">
                    <div class="column is-9">
                        <!-- TODO write instead the corrent :action this :action="`/ssl/get/pfx/${cert._id}`" -->
                        <form v-if="!is_loading" method="get" :action="`/ssl/get/pfx/`">
                            <button class="button is-light has-text-info is-small" type="submit">
                                Download PFX
                            </button>
                        </form>
                    </div>
                    <div class="column is-3 has-text-right">
                        <button
                            class="button is-small"
                            @click="resetEditModal"
                            v-if="!is_loading">
                            Cancel
                        </button>
                        <!-- TODO: add to button below in saveEditorCertificate(cert._id) -->
                        <button
                            @click="saveEditCertificate()"
                            :disabled="isSaveEditDisabled"
                            class="button is-small"
                            :class="{ 'is-loading': is_loading }">
                            Save
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
// type CertificateFields = 'subject' | 'issuer' | 'san' | 'cert_body'
export default {
  props: {
    editShown: Boolean,
    clickedRow: String,
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
      selectedApps: [],
      assignedApps: [],
      selectedCertId: '',
      certAction: 'attach_to_application',
      is_loading: false,
      update_le: false,
      sites_by_cert_name_map: {},
      cnamesForSelect: [],
      searchMultiselect: '',
      multiselectOpen: false,
      balancers: [],
      link_to_certificates_map: {},
      test: false,
    }
  },
  computed: {
    isAttachSelectedOnEdit() {
      return this.certAction === 'attach_to_application'
    },

    isReplaceSelectedOnEdit() {
      return this.certAction === 'replace_certificate'
    },

    isPem() {
      return this.certAction === 'pem'
    },

    isSaveEditDisabled() {
      return !this.update_le && (!this.certActionSelected || this.isEditOptionNotSelected || this.is_loading)
    },

    isAttachedAppsChanged() {
      return (this.assignedApps.some((app) => {
        return !this.selectedApps.some((selected) => selected === app)
      }) ||
                this.selectedApps.some((app) => {
                  return !this.assignedApps.some((assigned) => assigned === app)
                }))
    },

    selectedAppsLabel() {
      const selectedLen = this.selectedApps.length
      const s = selectedLen === 1 ? '' : 's'
      return selectedLen + ' app' + s + ' selected'
    },

    assignedCertsNames() {
      const certs = new Set(Object.keys(this.sites_by_cert_name_map))
      this.balancers.forEach((bal) => bal.certificates.forEach(
        /* TODO: (cert:any) => certs.add(this.link_to_certificates_map[cert]) */
      ))
      return [...certs]
    },

    assignedCertsNamesExceptCurrent() {
      // TODO: return this.assignedCertsNames.filter(cert => cert !== this.cert._id)
      return true
    },

    certCanReplaceByLE():any {
      // TODO: return !this.cert['san'] || !this.cert['san'].includes('*')
      return true
    },

    getConnectedSitesForEditCert():string {
      /* TODO: if (this.sites_by_cert_name_map[this.cert._id]) {
                return this.sites_by_cert_name_map[this.cert._id].join(' , ')
            } */
      return ''
    },

    optionsMultiselect() {
      const options = this.cnamesForSelect.map(
                (opt) => ({label: opt, checked: this.assignedApps.includes(opt)}),
      )
      const filterCb = (re:any) => ({label}:any) => String(label).match(re)
      return this.filterGrid(this.searchMultiselect, options, filterCb)
    },

    // TODO: this is really importent pice of code
    isEditOptionNotSelected() {
      const isAttachOptionNotSelected = this.isAttachSelectedOnEdit &&
                                              this.selectedApps.length === this.assignedApps.length &&
                                              !this.isAttachedAppsChanged
      const isReplaceOptionNotSelected = this.isReplaceSelectedOnEdit && !this.selectedCertId
      return isAttachOptionNotSelected || isReplaceOptionNotSelected
    },
    isEditOptionSelected() {
      return !this.isEditOptionNotSelected
    },

    isRemovedAppsFromCert() {
      return this.assignedApps.some((app) => {
        return !this.selectedApps.includes(app)
      })
    },
  },
  methods: {
    resetEditModal() {
      this.$emit('editShownChanged', false)
      this.cert = ''
      this.selectedApps = []
      this.assignedApps = []
      this.selectedCertId = ''
      this.certAction = 'attach_to_application'
      this.update_le = false
    },

    changeUpdateLE() {
      this.update_le = !this.update_le
    },

    filteredCertFields() {
      return Object.keys(this.CERT_FIELDS_LABELS)
    },

    onSearchMultiselect(search:any) {
      this.searchMultiselect = search
    },

    openMultiselect() {
      this.multiselectOpen = true
    },

    closeMultiselect() {
      this.multiselectOpen = false
    },

    certActionSelected() {
      return this.certAction !== ''
    },

    filterGrid(str:any, data:any, filterCallback:any) {
      let result = data
      const search = str.trim()
      if (search) {
        const doSearch = (s:any) => {
          const re = new RegExp(s.replaceAll('.', '\\.'), 'i')
          return result.filter(filterCallback(re))
        }
        try {
          result = doSearch(search)
        } catch (err) {
          try {
            result = doSearch(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
          } catch (e) {
            console.log(e)
          }
        }
      }
      return result
    },

    async saveEditCertificate() { // TODO: add certId:any to the args
      /* this.is_loading = true;
            const getError = (err:any) => ([
                `Failed to update certificate ${typeof err === 'string' ? `with error: ${err}` : ''}`,
                true
            ]);
            let msg = [ `${certId} updated successfully`, false, false ];
            if(this.isEditOptionSelected || this.update_le ) {
                try {
                    let newCertName =  certId
                    let certCase = 'edit_certificate'
                    let applicationNames
                    let removedApps
                    if ( this.isAttachSelectedOnEdit ) {
                        // TODO: certData.applicationNames = this.selectedApps;
                        if ( this.isRemovedAppsFromCert ) {
                            removedApps = this.assignedApps.reduce (( apps, app ) => {
                                if(!this.selectedApps.includes(app)) {
                                    apps.push(app)
                                }
                                return apps
                            }, []);
                        }
                    }
                    if ( this.isReplaceSelectedOnEdit ) {
                        certData.newCert = cert;
                        certData.cert_to_replace_name = selectedCertId;
                        certData.cert_to_replace = this.certificates.find (({ _id }: any) => _id === selectedCertId );
                        certData.cert_to_replace.sites = this.sites_by_cert_name_map [ selectedCertId ];
                    }

                    if ( this.isPem ) {
                        certData.cert_body = cert.cert_body
                    }

                    const formData = new FormData();
                    formData.append ( 'action', certAction );
                    formData.append ( '_xsrf', _xsrf() );
                    formData.append ( 'data', btoa ( JSON.stringify ( certData )));

                    if ( this.update_le ) {
                        formData.append ( 'update_le', true );
                        formData.append ( 'le_auto_replace', cert.le_auto_replace );
                        if ( cert.issuer.includes ( "Let's Encrypt" )) {
                            cert.le_auto_renew = true;
                        }
                        formData.append ( 'le_auto_renew', cert.le_auto_renew );
                    }

                    const { data } = await axios ({
                        method: 'post',
                        url: '/ssl-gcp',
                        data: formData,
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if ( data.error ) {
                        msg = getError ( data.error );
                    }
                    else {
                        this.certificatesList = [];
                        this.resetEditModal();
                        await this.getLoadBalancers();
                    }
                }
                catch ( e ) {
                    msg = getError();
                }
            }
            this.notify ( ...msg );
            this.is_loading = false; */
    },
  },
}
</script>
<style scoped lang="scss">

</style>
