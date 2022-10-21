<template>
  <div class="card">
    <div class="card-content"
         v-if="selectedMobileSDK">
      <div class="media">
        <div class="media-content">
          <div class="columns">
            <div class="column">
              <div class="field is-grouped">
                <p class="control">
                  <button class="button is-small redirect-list-button"
                          @click="redirectToList()"
                          title="Return to list"
                          data-qa="redirect-to-list">
                        <span class="icon is-small">
                          <i class="fas fa-arrow-left"></i>
                        </span>
                  </button>
                </p>
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
                        {{ name }}
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
                  <button class="button is-small save-document-button"
                          :class="{'is-loading': isSaveLoading}"
                          title="Save changes"
                          data-qa="save-changes"
                          @click="saveChanges()">
                    <span class="icon is-small">
                      <i class="fas fa-save"></i>
                    </span>
                  </button>
                </p>
                <p class="control">
                  <button class="button is-small has-text-danger delete-document-button"
                          title="Delete document"
                          data-qa="delete-document"
                          :class="{'is-loading': isDeleteLoading}"
                          :disabled="selectedMobileSDK?.id === '__default__'"
                          @click="deleteDoc()">
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
      <hr/>
      <div class="card">
        <div class="card-content">
          <div class="content">
            <div class="columns columns-divided">
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id"
                          title="Rule id">
                            {{ selectedMobileSDK.id }}
                        </span>
                  </label>
                  <div class="control">
                    <input class="input is-small document-name"
                           title="Document name"
                           :placeholder="selectedMobileSDK.name"
                           v-model="selectedMobileSDK.name"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Description</label>
                    <div class="control">
                          <textarea class="is-small textarea document-description"
                                    data-qa="description-input"
                                    title="Document description"
                                    rows="8"
                                    v-model="selectedMobileSDK.description">
                          </textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-8">
                <div class="field">
                  <label class="label is-small">Grace Period</label>
                  <div class="control suffix seconds-suffix mb-0">
                    <input type="text"
                           v-model="selectedMobileSDK.grace"
                           class="input is-small">
                  </div>
                  <div class="help">
                    Number of seconds considered as "grace time" for late arrivals of signatures
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">Token Header Name</label>
                  <div class="control mb-0">
                    <input type="text"
                           v-model="selectedMobileSDK.uid_header"
                           class="input is-small">
                  </div>
                  <div class="help">
                    The header that contains a user or session authentication token
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label is-small">
                App Signatures
              </label>
              <div class="control">
                <table class="table is-narrow">
                  <thead>
                  <tr>
                    <th class="is-size-7 width-300px">Name</th>
                    <th class="is-size-7 width-500px">Hash</th>
                    <th class="is-size-7 width-60px has-text-centered pr-2">Active</th>
                    <th class="is-size-7 width-100px has-text-right">
                      <a class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                         title="Add a signature"
                         data-tooltip="Add a signature"
                         @click="openAddSignatureMode">
                        <span class="icon is-small">
                          <i class="fas fa-plus"></i>
                        </span>
                      </a>
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(signature, index) in selectedMobileSDK.signatures"
                      :key="index">
                    <td class="is-size-7 width-300px"
                        :title="signature.name">
                      {{ signature.name }}
                    </td>
                    <td class="is-size-7 width-500px"
                        :title="signature.hash">
                      {{ signature.hash }}
                    </td>
                    <td class="is-size-7 width-60px has-text-centered">
                      <input type="checkbox"
                             v-model="signature.active"
                             :checked:boolean="signature.active"
                             :class="{'checkbox-active':signature.active}"/>
                    </td>
                    <td class="is-size-7 width-100px has-text-right">
                      <a class="is-small has-text-grey"
                         title="remove signature"
                         @click="removeSignature(index)">
                        remove
                      </a>
                    </td>
                  </tr>
                  <tr v-if="addSignatureMode">
                    <td class="is-size-7 width-300px">
                      <input type="text"
                             class="input is-small"
                             v-model="newSignature.name"
                             ref="newSignature"/>
                    </td>
                    <td class="is-size-7 width-500px">
                      <input class="input is-small"
                             v-model="newSignature.hash"/>
                    </td>
                    <td class="is-size-7 width-60px is-vcentered has-text-centered">
                      <input type="checkbox"
                             v-model="newSignature.active"
                             :checked:boolean="newSignature.active"
                             :class="{'checkbox-active' : newSignature.active}"/>
                    </td>
                    <td class="is-size-7 width-100px is-vcentered has-text-right">
                      <a class="is-small has-text-grey"
                         title="add signature"
                         @click="confirmAddSignature">
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
            </div>
            <div class="field">
              <label class="label is-small">
                Profiles
              </label>
              <div class="control">
                <table class="table is-narrow">
                  <thead>
                  <tr>
                    <th class="is-size-7 width-300px">Name</th>
                    <th class="is-size-7 width-500px"></th>
                    <th class="is-size-7 width-60px has-text-centered pr-2">Active</th>
                    <th class="is-size-7 width-100px has-text-right">
                      <a class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                         title="Add a configuration profile"
                         data-tooltip="Add a configuration profile"
                         @click="openAddConfigMode">
                        <span class="icon is-small">
                          <i class="fas fa-plus"></i>
                        </span>
                      </a>
                    </th>
                  </tr>
                  </thead>
                  <tbody v-if="!(selectedMobileSDK.active_config?.length) && !addConfigMode">
                  <tr>
                    <td colspan="4">
                      <p class="is-size-7 has-text-grey has-text-centered">
                        No configurations added yet
                      </p>
                    </td>
                  </tr>
                  </tbody>
                  <tbody v-else>
                  <tr v-for="(config, index) in selectedMobileSDK.active_config"
                      :key="index"
                      :class="{'has-background-light': configAdditionalInfoIndex === index}"
                      @click="setConfigAdditionalInfoIndex(index)">
                    <td class="is-size-7 width-300px has-row-clickable"
                        :title="config.name">
                      <div v-if="configAdditionalInfoIndex === index && index !== 0">
                        <input class="input is-small"
                               type="text"
                               :value="config.name"
                               @click.stop
                               @input="editConfigName($event, index)"/>
                      </div>
                      <span v-else>{{ config.name }}</span>
                    </td>
                    <td class="is-size-7 width-500px has-row-clickable">
                      <textarea v-if="configAdditionalInfoIndex === index"
                                rows="7"
                                class="textarea is-small is-fullwidth json-textarea"
                                placeholder="Paste the JSON"
                                :value="config.json"
                                @click.stop
                                @input="editConfig($event, index)"
                                :disabled="index === 0">
                      </textarea>
                    </td>
                    <td class="is-size-7 width-60px has-text-centered has-row-clickable">
                      <input type="radio"
                             :checked="config.active"
                             @click.stop
                             @change="activateConfig(index)">
                    </td>
                    <td class="is-size-7 width-100px has-row-clickable close-remove has-text-right">
                      <a class="is-small has-text-grey"
                         title="more details">
                        {{ configAdditionalInfoIndex === index ? 'close' : 'expand' }}
                      </a>
                      <button title="Remove this configuration"
                              class="button x-is-text is-small is-pulled-right is-danger is-light"
                              @click="removeConfig(index)"
                              v-if="configAdditionalInfoIndex === index && index !== 0">
                        delete
                      </button>
                    </td>
                  </tr>
                  </tbody>
                  <tfoot>
                  <tr v-if="addConfigMode">
                    <td class="is-size-7 width-300px">
                      <input class="input is-small"
                             type="text"
                             ref="newConfig"
                             placeholder="Configuration name"
                             :value="newConfig.name"
                             @input="editConfigName"/>
                    </td>
                    <td class="is-size-7 width-500px">
                      <textarea rows="5"
                                class="textarea is-small is-fullwidth"
                                placeholder="Paste the JSON"
                                :value="newConfig.json"
                                @input="editConfig">
                      </textarea>
                    </td>
                    <td class="is-size-7 width-60px has-text-centered is-vcentered">
                      <input type="radio"
                             :checked="newConfig.active"/>
                    </td>
                    <td class="is-size-7 width-100px is-vcentered has-text-right">
                      <a class="is-small has-text-grey"
                         title="add configuration"
                         @click="confirmAddConfig">
                        add
                      </a>
                      |
                      <a class="is-small has-text-grey"
                         @click="closeAddConfigMode">
                        cancel
                      </a>
                    </td>
                  </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <span class="is-family-monospace has-text-grey-lighter">{{ documentAPIPath }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {defineComponent} from 'vue'
import {MobileSDK} from '@/types'

export default defineComponent({
  name: 'MobileSDKEditor',
  data() {
    const getInitSignature = () => ({name: '', hash: '', active: true})
    const getInitConfig = () => ({name: '', json: '', active: true})
    return {
      titles: DatasetsUtils.titles,
      configs: [],
      selectedBranch: null,
      selectedMobileSDK: null as MobileSDK,
      docIdFromRoute: '',

      // App Signatures
      addSignatureMode: false,
      newSignature: getInitSignature(),
      getInitSignature: getInitSignature,

      // Profiles / Configs
      addConfigMode: false,
      newConfig: getInitConfig(),
      getInitConfig: getInitConfig,
      configAdditionalInfoIndex: null,

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
    },

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },
  },
  methods: {
    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params.doc_id.toString()
      await this.loadMobileSDK()
      this.setLoadingDocStatus(false)
    },

    async loadConfigs() {
      let configs
      try {
        const response = await RequestsUtils.sendRequest({
          methodName: 'GET',
          url: 'configs/',
          config: {headers: {'x-fields': 'id'}},
        })
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      console.log('loaded configs: ', configs)
      this.configs = configs
      this.selectedBranch = this.branchNames[0]
    },

    redirectToList() {
      this.$router.push(`/mobile-sdks/list`)
    },

    setLoadingDocStatus(isLoading: boolean) {
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

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('mobile-sdk', 'json', this.selectedMobileSDK)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const mobileSDKText = this.titles['mobile-sdks-singular']
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
      const successMessage = `The ${mobileSDKText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${mobileSDKText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.redirectToList()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges() {
      this.isSaveLoading = true
      const methodName = 'PUT'
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
      const data = this.selectedMobileSDK
      const mobileSDKText = this.titles['mobile-sdks-singular']
      const successMessage = `Changes to the ${mobileSDKText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${mobileSDKText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async loadMobileSDK() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.docIdFromRoute}`,
        onFail: () => {
          console.log('Error while attempting to load the Mobile SDK')
          this.selectedMobileSDK = null
          this.isDownloadLoading = false
        },
      })
      this.selectedMobileSDK = response?.data || {}
      this.selectedMobileSDK.signatures = _.sortBy(this.selectedMobileSDK.signatures, (signature) => {
        return !signature.active
      }) || []
      if (this.selectedMobileSDK.active_config) {
        this.selectedMobileSDK.active_config = this.selectedMobileSDK.active_config.map((activeConfig) => ({
          ...activeConfig,
          json: JSON.stringify(JSON.parse(activeConfig.json), null, 2),
        }))
      }
      this.isDownloadLoading = false
    },

    // App Signatures

    openAddSignatureMode() {
      this.addSignatureMode = true
      this.$nextTick(() => {
        this.$refs.newSignature.focus()
      })
    },

    confirmAddSignature() {
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

    removeSignature(index: number) {
      this.selectedMobileSDK.signatures = this.selectedMobileSDK.signatures.filter((el, signatureIndex) => {
        return signatureIndex !== index
      })
    },

    // Profiles / Configs

    openAddConfigMode() {
      this.addConfigMode = true
      this.$nextTick(() => {
        this.$refs.newConfig.focus()
      })
    },

    confirmAddConfig() {
      const configName = this.newConfig.name.trim()
      if (configName.length) {
        this.selectedMobileSDK.active_config = [
          ...this.selectedMobileSDK.active_config.map((config) => ({...config, active: false})),
          {...this.newConfig, name: configName},
        ]
        this.closeAddConfigMode()
      }
    },

    closeAddConfigMode() {
      this.newConfig = this.getInitConfig()
      this.addConfigMode = false
    },

    removeConfig(index: number) {
      const isActive = this.selectedMobileSDK.active_config[index].active
      this.selectedMobileSDK.active_config = this.selectedMobileSDK.active_config.filter((el, configIndex) => {
        return configIndex !== index
      })
      if (isActive && this.selectedMobileSDK.active_config[index - 1]) {
        this.selectedMobileSDK.active_config[index - 1].active = true
      }
    },

    setConfigAdditionalInfoIndex(index: number) {
      this.configAdditionalInfoIndex = this.configAdditionalInfoIndex === index ? null : index
    },

    editConfigName(event: Event, index?: number) {
      const value = (event.target as HTMLInputElement)?.value
      if (_.isNil(index)) {
        this.newConfig.name = value
      } else {
        this.selectedMobileSDK.active_config[index].name = value
      }
    },

    editConfig(event: Event, index?: number) {
      const value = (event.target as HTMLTextAreaElement)?.value
      if (_.isNil(index)) {
        this.newConfig.json = value
      } else if (index !== 0) {
        this.selectedMobileSDK.active_config[index].json = value
      }
    },

    activateConfig(index: number) {
      const config = this.selectedMobileSDK.active_config.find((el, configIndex) => {
        return configIndex === index
      })
      if (config && !config.active) {
        this.selectedMobileSDK.active_config.forEach((con, configIndex) => {
          con.active = configIndex === index
        })
      }
    },
  },
  async created() {
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
  },
})
</script>

<style scoped
       lang="scss">
table {
  margin-bottom: 2rem;
  word-break: break-all;
}

.content table th {
  white-space: nowrap;
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
