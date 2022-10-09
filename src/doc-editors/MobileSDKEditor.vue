<template>
  <div class="card">
    <div class="card-content" v-if="selectedMobileSDK">
      <div class="media">
        <div class="media-content">
          <div class="columns">
            <div class="column">
              <div class="field is-grouped">
                <div class="control"
                     v-if="branchNames.length">
                  <div class="select is-small">
                    <select v-model="selectedBranch"
                            title="Switch branch"
                            class="branch-selection"
                            @change="switchBranch()">
                      <option v-for="name in branchNames"
                              :key="name"
                              :value="name">
                        {{name}}
                      </option>
                    </select>
                  </div>
                </div>
                <p class="control">
                  <button class="button is-small download-doc-button"
                          :class="{'is-loading':isDownloadLoading}"
                          @click="downloadDoc()"
                          title="Download document"
                          data-qa="download-document">
                    <span class="icon is-small">
                      <i class="fas fa-download"></i>
                    </span>
                  </button>
                </p>
              </div>
            </div>
            <div class="column">
              <div class="field is-grouped is-pulled-right">
                <p class="control">
                  <button class="button is-small save-document-button" :class="{'is-loading': isSaveLoading}"
                    title="Save changes" data-qa="save-changes" @click="saveChanges()">
                    <span class="icon is-small">
                      <i class="fas fa-save"></i>
                    </span>
                  </button>
                </p>
                <p class="control">
                  <button class="button is-small has-text-danger delete-document-button" title="Delete document"
                    data-qa="delete-document" :class="{'is-loading': isDeleteLoading}" @click="deleteDoc">
                    <span class="icon is-small">
                      <i class="fas fa-trash"></i>
                    </span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <hr />
        <div class="columns columns-divided">
          <div class="column is-3">
            <div class="field">
              <label class="label is-small">
                Name
                <span class="has-text-grey is-pulled-right document-id"
                      title="Rule id">
                        {{ selectedMobileSDK.id }}
                    </span>
              </label>
              <div class="control">
                <input class="input is-small routing-name"
                       title="Document name"
                       :placeholder="selectedMobileSDK.name"
                       v-model="selectedMobileSDK.name"/>
              </div>
            </div>
            <div class="field">
              <div class="field textarea-field">
                <label class="label is-small">Description</label>
                <div class="control">
                      <textarea class="is-small textarea routing-description"
                                data-qa="routing-input"
                                title="selectedRoutingProfile.description"
                                rows="8"
                                v-model="selectedMobileSDK.description">
                      </textarea>
                </div>
                </div>
              </div>
            </div>
          <div class="column is-9">
            <p class="subtitle is-6 is-uppercase">App Signatures</p>
            <div class="content">
              <table class="table is-narrow">
                <thead>
                  <tr>
                    <th class="is-size-7 is-360-px">Name</th>
                    <th class="is-size-7 is-500-px">Hash</th>
                    <th class="is-size-7 has-text-centered pr-2">Active</th>
                    <th class="is-size-7 w-94 has-text-right">
                      <a class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                        title="Add a signature" data-tooltip="Add a signature" @click="openAddSignatureMode">
                        <span class="icon is-small">
                          <i class="fas fa-plus"></i>
                        </span>
                      </a>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(signature,key) in selectedMobileSDK.signatures" :key="key">
                    <td class="is-size-7 is-360-px" :title="signature.name">
                      {{signature.name}}
                    </td>
                    <td class="is-size-7 is-500-px" :title="signature.hash">
                      {{signature.hash}}
                    </td>
                    <td class="is-size-7 has-text-centered">
                      <input type="checkbox"
                             v-model="signature.active"
                             :checked:boolean="signature.active"
                             :class="{'checkbox-active':signature.active}" />
                    </td>
                    <td class="is-size-7 w-94 has-text-right">
                      <a class="is-small has-text-grey" title="remove signature" @click="removeSignature(key)">
                        remove
                      </a>
                    </td>
                  </tr>
                  <tr v-if="addSignatureMode">
                    <td class="is-size-7 is-360-px">
                      <input type="text"
                             class="input is-small"
                             v-model="newSignature.name"
                             ref="newSignature"/>
                    </td>
                    <td class="is-size-7 is-360-px">
                      <input class="input is-small"
                             v-model="newSignature.hash"/>
                    </td>
                    <td class="is-size-7 is-vcentered has-text-centered">
                      <input type="checkbox"
                             v-model="newSignature.active"
                             :checked:boolean="newSignature.active"
                             :class="{'checkbox-active' : newSignature.active}"/>
                    </td>
                    <td class="is-size-7 w-94 is-vcentered has-text-right">
                      <a class="is-small has-text-grey"
                         title="add signature"
                         @click="addSignature">
                        add
                      </a>
                      |
                      <a class="is-small has-text-grey"
                         @click="closeAddSignatureMode">
                        cancel
                      </a>
                    </td>
                  </tr>
                  <tr v-else-if="!selectedMobileSDK.signatures?.length">
                    <td colspan="4">
                      <p class="is-size-7 has-text-grey has-text-centered">
                        No signatures added yet
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="subtitle is-6 is-uppercase">Profiles</p>
            <div class="content">
              <table class="table is-narrow">
                <thead>
                  <tr>
                    <th class="is-size-7 is-360-px">Name</th>
                    <th class="is-size-7 is-500-px"></th>
                    <th class="is-size-7 has-text-centered pr-2">Active</th>
                    <th class="is-size-7 w-94 has-text-right">
                      <a class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                        title="Add a configuration profile" data-tooltip="Add a configuration profile"
                        @click="openAddConfigMode">
                        <span class="icon is-small">
                          <i class="fas fa-plus"></i>
                        </span>
                      </a>
                    </th>
                  </tr>
                </thead>
                <tbody v-for="(config,key) in selectedMobileSDK.active_config" :key="key">
                  <tr :class="{'has-background-light': seeConfig === key}">
                    <td class="is-size-7 is-360-px has-row-clickable" :title="config.name"
                      @click="({target}) => target.type ? false : toggleConfig(key)">
                      <div v-if="seeConfig === key && (!isDefaultConfig(config) || key )">
                        <input class="input is-small" type="text" v-model="config.name"
                          @input="editConfigName($event, key)" />
                      </div>
                      <span v-else>{{config.name}}</span>
                    </td>
                    <td class="is-size-7 is-500-px has-row-clickable"
                      @click="({target}) => target.classList.contains('textarea') ? false : toggleConfig(key)">
                      <textarea v-if="seeConfig === key" rows="7" class="textarea is-small is-fullwidth json-textarea"
                        placeholder="Paste the JSON" v-model="config.json" @input="editConfig($event, key)">
                                      </textarea>
                    </td>
                    <td class="is-size-7 has-text-centered has-row-clickable"
                      @click="({target}) => target.type? false : toggleConfig(key)">
                      <input type="radio" :checked="config.active" @change="activeConfig($event, key)">
                    </td>
                    <td class="is-size-7 w-94 has-row-clickable close-remove has-text-right" @click="toggleConfig(key)">
                      <a class="is-small has-text-grey" title="more details">
                        {{seeConfig === key ? 'close' : 'expand'}}
                      </a>
                      <button title="Remove this configuration"
                        class="button x-is-text is-small is-pulled-right is-danger is-light" @click="removeConfig(key)"
                        v-if="seeConfig === key && (!isDefaultConfig(config) || key)">
                        delete
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-if="!(selectedMobileSDK.active_config?.length) && !addConfigMode">
                  <tr>
                    <td colspan="4">
                      <p class="is-size-7 has-text-grey has-text-centered">
                        No configurations added yet
                      </p>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr v-if="addConfigMode">
                    <td class="is-size-7 is-360-px">
                      <input class="input is-small" type="text" ref="newConfig" placeholder="Configuration name"
                        :value="newConfig.name" @input="editConfigName" />
                    </td>
                    <td class="is-size-7 is-500-px">
                      <textarea rows="5" class="textarea is-small is-fullwidth" placeholder="Paste the JSON"
                        :value="newConfig.json" @input="editConfig">
                                      </textarea>
                    </td>
                    <td class="is-size-7 has-text-centered is-vcentered">
                      <input type="radio" :checked="newConfig.active" />
                    </td>
                    <td class="is-size-7 w-94 is-vcentered has-text-right">
                      <a class="is-small has-text-grey" title="add configuration" @click="addConfig">
                        add
                      </a>
                      |
                      <a class="is-small has-text-grey" @click="cancelConfig">
                        cancel
                      </a>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="columns">
              <div class="column is-6">
                <div class="field">
                  <label class="label is-small">Grace Period</label>
                  <div class="control has-addons field mb-0">
                    <input type="text" label="Grace Period" addon="seconds" v-model="selectedMobileSDK.grace" class="input is-small"/>
                    <p class="control">
                      <a class="button is-static is-small">
                        seconds
                      </a>
                    </p>
                  </div>
                </div>
                <div class="help">
                  Number of seconds considered as "grace time" for late arrivals of signatures
                </div>
              </div>
              <div class="column is-6">
                <div class="field">
                  <label class="label is-small">Token Header Name</label>
                  <input type="text" label="Token Header Name" v-model="selectedMobileSDK.uid_header" class="input is-small">
                </div>
                  <div class="help">
                  The header that contains a user or session authentication token
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div class="content">
        <fieldset class="fieldset challenge mx-0 my-0" :class="{'collapsed-old-params' : !isOldParamsEnabled}">
          <legend>v1.9.2 and earlier ({{isOldParamsEnabled ? 'enabled' : 'disabled'}})</legend>
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label is-small">Secret</label>
                <div class="control">
                  <input type="text" title="Double-click to reveal" @dblclick="revealSecret"
                    class="input is-small secret" :readonly="!revealed" v-model="secret" />
                </div>
                <p class="help">Double-click to reveal</p>
              </div>
              <div class="field">
                <label class="label is-small">Variable Name</label>
                <input type="text" v-model="selectedMobileSDK.var_name" label="Variable Name" class="input is-small"/>
                <div class="help">
                  The header, cookie or argument that contains a unique value to identify the user
                </div>
              </div>
              <div class="field">
                <label class="label is-small">Hashing Mechanism</label>
                <input v-model="selectedMobileSDK.validator_type" label="Hashing Mechanism" class="input is-small"/>
                <div class="help">
                  Do not change unless instructed
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label is-small">Grace Period</label>
                <div class="control has-addons field mb-0">
                  <input v-model="selectedMobileSDK.grace" label="Grace Period" addon="seconds" disabled="true" class="input is-small"/>
                  <p class="control">
                    <a class="button is-static is-small">
                      seconds
                    </a>
                  </p>
              </div>
              <div class="help">
                Number of seconds considered as "grace time" for late arrivals of signatures
              </div>
            </div>
            <div class="field">
              <label class="label is-small">Grace Variable Name</label>
              <input v-model="selectedMobileSDK.grace_var_name" label="Grace Variable Name" class="input is-small"/>
              <div class="help">
                The header, cookie or argument used to transmit the request's timestamp
              </div>
              </div>
            </div>
          </div>
          <label class="checkbox is-size-7">
            <input type="checkbox" @click="collapseToggle" v-model="isOldParamsEnabled" />
            enable
          </label>
        </fieldset>
      </div>

    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import DatasetsUtils from '@/assets/DatasetsUtils'
export default {
  /* TODO: Need to change all to support Typescript */
  data() {
    const getInitSignature = () => ({name: '', hash: '', active: true})
    const getDefaultSite = () => ({
      config: {globals: {custom_challenge: {}}},
      limit_ids: [],
      workers: [],
    })
    const getInitConfig = () => ({name: '', json: '', active: true})
    return {
      addSignatureMode: false,
      newSignature: getInitSignature(),
      current_site: getDefaultSite(),
      newConfig: getInitConfig(),
      getInitSignature: () => ({name: '', hash: '', active: true}),
      getInitConfig: () => ({name: '', json: '', active: true}),
      seeConfig: null,
      PATH_LEVEL_PROFILE_VALIDATION_FIELDS: {
        name: 'Name',
        match: 'Match',
        upstream: 'Backend Service',
        acl_profile: 'ACL Profile',
        waf_profile: 'WAF Profile',
      },
      revealed: false,
      addConfigMode: false,
      selectedMobileSDK: null,
      idFromRoute: '',
      isOldParamsEnabled: false,
      loadingDocCounter: 0,
      configs: [],
      selectedBranch: null,
      branches: 0,
      isDeleteLoading: false,
      titles: DatasetsUtils.titles,
      isSaveLoading: false,
    }
  },
  computed: {
    secret: {
      get() {
        return this.revealed ? this.selectedMobileSDK.secret : '•'.repeat(this.selectedMobileSDK.secret?.length)
      },
      set(newVal) {
        if (this.selectedMobileSDK) {
          this.selectedMobileSDK.secret = newVal
        }
      },
    },

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },
  },
  methods: {
    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('mobile-sdk', 'json', this.selectedMobileSDK)
      }
    },

    async saveChanges() {
      this.isSaveLoading = true
      const methodName = 'PUT'
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
      const data = this.selectedMobileSDK
      const mobileSDKText = this.titles['mobilesdks-singular']
      const successMessage = `Changes to the ${mobileSDKText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${mobileSDKText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    setLoadingDocStatus(isLoading) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadMobileSDK()
      this.setLoadingDocStatus(false)
    },

    async loadMobileSDK() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.idFromRoute}`,
        onFail: () => {
          console.log('Error while attempting to load mobile sdk')
          this.selectedRoutingProfile = null
          this.isDownloadLoading = false
        },
      })
      this.selectedMobileSDK = response?.data || {}
      this.selectedMobileSDK.signatures = _.sortBy(this.selectedMobileSDK.signatures, (signature) => !signature.active) || []
      if (this.selectedMobileSDK.active_config) {
        this.selectedMobileSDK.active_config = this.selectedMobileSDK.active_config.map((activeConfig) => ({...activeConfig, json: JSON.stringify(JSON.parse(activeConfig.json), null, 2)}))
      }
      this.isDownloadLoading = false
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.idFromRoute = this.$route.params.doc_id.toString()
      await this.loadMobileSDK()
      this.setLoadingDocStatus(false)
    },

    collapseToggle() {
      this.isOldParamsEnabled = !this.isOldParamsEnabled
    },

    cancelConfig() {
      this.newConfig = this.getInitConfig()
      this.addConfigMode = false
    },

    goToRoute() {
      const routeToDoc = `/mobilesdk/list/`
      this.$router.push(routeToDoc)
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const mobileSDKText = this.titles['mobilesdks-singular']
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
      const successMessage = `The ${mobileSDKText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${mobileSDKText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.goToRoute()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },

    openAddSignatureMode() {
      this.addSignatureMode = true
      this.$nextTick(() => {
        this.$refs.newSignature.focus()
      })
    },

    addSignature() {
      const {name, hash} = _.mapValues(this.newSignature, (val) => String(val).replace(/[\s:]+/g, ''))
      if (name.length && hash.length) {
        this.selectedMobileSDK.signatures.push({name, hash, active: this.newSignature.active})
        this.closeAddSignatureMode()
      }
    },

    closeAddSignatureMode() {
      this.newSignature = this.getInitSignature()
      this.addSignatureMode = false
    },

    editSignatureName({target}) {
      this.newSignature.name = target.value
    },

    openAddConfigMode() {
      this.addConfigMode = true
      this.$nextTick(() => {
        this.$refs.newConfig.focus()
      })
    },

    toggleConfig(configId) {
      this.seeConfig = this.seeConfig === configId ? null : configId
    },

    isDefaultConfig(config) {
      return config.name.toLowerCase() === 'default'
    },

    addConfig() {
      const configName = this.newConfig.name.trim()
      if (configName.length) {
        this.selectedMobileSDK.active_config = [
          ...this.selectedMobileSDK.active_config.map((c) => ({...c, active: false})),
          {...this.newConfig, name: configName},
        ]
        this.newConfig = this.getInitConfig
        this.addConfigMode = false
      }
    },

    removeConfig(index) {
      const isActive = this.selectedMobileSDK.active_config[index].active
      this.selectedMobileSDK.active_config = this.selectedMobileSDK.active_config.filter((el, key) => key !== index)
      if (isActive && this.selectedMobileSDK.active_config[index - 1]) {
        this.selectedMobileSDK.active_config[index - 1].active = true
      }
    },

    editConfigName({target}, id = '') {
      const {value} = target
      if (id === '') {
        this.newConfig.name = value
      } else {
        this.selectedMobileSDK.active_config[id].name = value
      }
    },

    editConfig({target}, id = '') {
      const config = this.selectedMobileSDK.active_config.find((el, key) => key === id)
      if (id === '' || !this.isDefaultConfig(config)) {
        const {value} = target
        if (id === '') {
          this.newConfig.json = value
        } else {
          this.selectedMobileSDK.active_config[id].json = value
        }
      }
    },

    revealSecret() {
      this.revealed = !this.revealed
    },

    removeSignature(id) {
      this.selectedMobileSDK.signatures = this.selectedMobileSDK.signatures.filter((el, key) => key !== id)
    },

    async loadConfigs(counterOnly) {
      // store configs
      let configs
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      if (!counterOnly) {
        console.log('loaded configs: ', configs)
        this.configs = configs
      }
      this.branches = _.size(configs)
      this.selectedBranch = this.branchNames[0]
    },
  },
  async created() {
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
  },
}
</script>
<style lang="scss">
/* TODO: Need to clean the unuse blocks */
.rbz-content hr {
  margin: 0.7rem 0;
  visibility: hidden;
}

table {
  word-break: break-all;
}

.card.is-100 {
  height: 100%;
}

.content table th {
  white-space: nowrap;
}

.textarea.domain-names {
  height: 20em;
}

.collapsible {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-items: center;
}

.collapsible-card {
  border: 1px solid #fff;
}

.collapsible-card:hover {
  border: 1px solid #b5b5b5;
}

.card.collapsed .collapsible-content {
  display: none;
}

.rbz-content .collapsed .media {
  margin: 0;
}

.collapsible .fa-angle-down {
  align-self: center;
}

.site-active-checkbox-wrapper,
.path-active-checkbox-wrapper {
  position: relative;
  width: 10px;
}

.site-active-checkbox-wrapper {
  margin-left: 2px;
}

.path-active-checkbox-wrapper {
  margin-right: 6px;
}

.active-checkbox {
  accent-color: #b5b5b5;
  height: 10px;
  position: absolute;
  top: calc(50% - 5px);
  width: 10px;
}

fieldset {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.02);
  color: #4a4a4a;
  display: block;
  padding: 1.25rem;
}

.fieldset>legend {
  background-color: #fff;
  border: 0 none;
  color: #363636;
  display: block;
  font-size: 1rem;
  font-weight: 700;
  padding: 0 5px;
  width: max-content;
}

.fieldset.challenge,
.checkbox {
  position: relative;
}

.fieldset.challenge .checkbox-active,
.checkbox {
  align-items: center;
  background: #fff;
  display: flex;
  justify-content: space-between;
  margin-top: -20px;
  position: absolute;
  right: 3%;
  top: 0;
  width: 4.6em;
  z-index: 2;
}

.fieldset.collapsed-old-params .columns {
  display: none;
}

.fieldset .content {
  margin-bottom: 0;
}

.field.buttons {
  bottom: 0;
  justify-content: flex-end;
  margin-bottom: 0;
  position: absolute;
  right: 0%;
  width: 100%;
}

.close-remove {
  position: relative;
}

.close-remove .button.is-danger {
  bottom: 1em;
  position: absolute;
  right: 0.5em;
}
</style>
