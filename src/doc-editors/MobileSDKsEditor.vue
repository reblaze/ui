<template>
  <div class="card-content" >
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
                  <span>
                    Return To List
                  </span>
                </button>
              </p>
              <div class="control doc-selection-wrapper"
                   v-if="docIdNames.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="doc-selection"
                          data-qa="switch-document">
                          <option v-for="doc in docIdNames"
                            :key="doc.id"
                            :value="doc.id">
                      {{ doc.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field is-grouped is-pulled-right">
              <p class="control">
                <button class="button is-small new-mobile-sdks-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewMobileSDK()"
                        title="Add new document"
                        :disabled="!selectedBranch"
                        data-qa="add-new-document">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span>
                    New
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small fork-document-button"
                        :class="{'is-loading': isForkLoading}"
                        @click="forkDoc()"
                        title="Duplicate document"
                        :disabled="!selectedMobileSDK"
                        data-qa="duplicate-document">
                  <span class="icon is-small">
                    <i class="fas fa-clone"></i>
                  </span>
                  <span>
                    Duplicate
                  </span>
                </button>
              </p>
              <p class="control">
                <button class="button is-small download-doc-button"
                        :class="{'is-loading':isDownloadLoading}"
                        @click="downloadDoc()"
                        title="Download document"
                        data-qa="download-document">
                  <span class="icon is-small">
                    <i class="fas fa-download"></i>
                  </span>
                  <span>
                    Download
                  </span>
                </button>
              </p>
              <p class="control">
                <button class="button is-small save-document-button"
                        :class="{'is-loading': isSaveLoading}"
                        title="Save changes"
                        data-qa="save-changes"
                        @click="saveChanges()">
                  <span class="icon is-small">
                    <i class="fas fa-save"></i>
                  </span>
                  <span>
                    Save
                  </span>
                </button>
              </p>
              <p class="control">
                <button class="button is-small has-text-danger delete-document-button"
                        title="Delete document"
                        data-qa="delete-document"
                        :class="{'is-loading': isDeleteLoading}"
                        :disabled="selectedDocNotDeletable"
                        @click="deleteDoc()">
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                  <span>
                    Delete
                  </span>
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr/>
    <div class="content"
         v-if="!loadingDocCounter && selectedBranch && selectedMobileSDK">
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
                                    rows="2"
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
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedMobileSDK ">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else @load="redirectToList()"
           class="no-data-message">
        No data found.
        <div>
            <span v-if="!selectedMobileSDK?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewMobileSDK()">
              here
            </a>
          </span>
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
import {DocumentName, MobileSDK, HttpRequestMethods} from '@/types'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'MobileSDKEditor',
  data() {
    const getInitSignature = () => ({name: '', hash: '', active: true})
    const getInitConfig = () => ({name: '', json: '', active: true})
    return {
      titles: DatasetsUtils.titles,
      docs: [] as unknown as MobileSDK[],
      docIdNames: [] as DocumentName[],
      selectedDocID: null,

      // App Signatures
      addSignatureMode: false,
      newSignature: getInitSignature(),
      getInitSignature: getInitSignature,

      // Profiles / Configs
      addConfigMode: false,
      newConfig: getInitConfig(),
      getInitConfig: getInitConfig,
      configAdditionalInfoIndex: null,

      // To prevent deletion of Mobile SDKs referenced by Server Groups
      referencedIDsMobileSDK: [],

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isForkLoading: false,
      isNewLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('MobileSDK/config') && val && val !== oldVal) {
          await this.loadDocs()
          await this.setSelectedDataFromRouteParams()
          // redirect to list if no data found
          if (!this.docs?.[0]?.id || !this.selectedMobileSDK) {
            this.redirectToList()
          }
          await this.loadReferencedMobileSDKsIDs()
        }
      },
      immediate: true,
    },
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedMobileSDK.id}/`
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedMobileSDK ||
          this.selectedMobileSDK.id.startsWith('__') || // Default entries
          this.isDocReferenced
    },

    isDocReferenced(): boolean {
      return this.referencedIDsMobileSDK.includes(this.selectedMobileSDK.id)
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    selectedDocIndex(): number {
      return _.findIndex(this.docs, (doc) => {
        return doc.id === this.selectedDocID
      })
    },
    selectedMobileSDK: {
      get(): MobileSDK {
        return (this.selectedDocIndex > -1) ? this.docs[this.selectedDocIndex] : null
      },
      set(newDoc: MobileSDK): void {
        if (this.selectedDocIndex > -1) {
          this.docs[this.selectedDocIndex] = newDoc
        }
      },
    },
  },
  methods: {
    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/mobile-sdks/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new mobile sdk document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.selectedDocID = this.$route.params?.doc_id?.toString()
      this.setLoadingDocStatus(false)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/mobile-sdks/list`)
    },

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async switchDocID() {
      this.setLoadingDocStatus(true)
      const docName = this.selectedMobileSDK.name
      if (docName) {
        Utils.toast(
            `Switched to document "${docName}" with ID: ${this.selectedDocID}.`,
            'is-info',
        )
      }
      this.goToRoute()
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

    async loadDocs() {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const branch = this.selectedBranch
      const url = `configs/${branch}/d/mobile-sdks/`

      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url,
        config: {headers: {'x-fields': 'id, name'}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      this.updateDocIdNames()

      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    updateDocIdNames() {
      this.docIdNames = this.docs.map((doc) => {
        return {id: doc.id, name: doc.name}
      })
      this.docIdNames = this.docIdNames.sort((a: DocumentName, b: DocumentName) => {
        let sortValueA: string = a.name || ''
        let sortValueB: string = b.name || ''
        const sortValueALowerCase: string = sortValueA.toString().toLowerCase()
        const sortValueBLowerCase: string = sortValueB.toString().toLowerCase()
        // only ignore case if the values are different from one another
        if (!_.isEqual(sortValueALowerCase, sortValueBLowerCase)) {
          sortValueA = sortValueALowerCase
          sortValueB = sortValueBLowerCase
        }
        if (sortValueA < sortValueB) {
          return -1
        }
        if (sortValueA > sortValueB) {
          return 1
        }
        return 0
      })
    },

    newMobileSDK(): MobileSDK {
      const factory = DatasetsUtils.newOperationEntryFactory['mobile-sdks']
      return factory && factory()
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedMobileSDK) as MobileSDK
      docToAdd.id = DatasetsUtils.generateUUID2()
      docToAdd.name = 'copy of ' + docToAdd.name + ' ' + docToAdd.id

      const docTypeText = this.titles['mobile-sdks-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewMobileSDK(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewMobileSDK(mobilesdksToAdd?: MobileSDK, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true

      if (!mobilesdksToAdd) {
        mobilesdksToAdd = this.newMobileSDK()
      }
      const mobileSDKsText = this.titles['mobile-sdks-singular']
      if (!successMessage) {
        successMessage = `New ${mobileSDKsText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${mobileSDKsText}.`
      }
      const data = mobilesdksToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)
      this.selectedDocID = mobilesdksToAdd.id

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: MobileSDK,
                      successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      if (!data) {
        data = this.selectedMobileSDK
      }
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${data.id}/`
      const mobileSDKText = this.titles['mobile-sdks-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${mobileSDKText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${mobileSDKText}.`
      }
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.loadDocs()

      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
    },

    // async loadMobileSDK() {
    //   this.setLoadingDocStatus(true)
    //   this.isDownloadLoading = true
    //   this.selectedMobileSDK = null
    //   const response = await RequestsUtils.sendReblazeRequest({
    //     methodName: 'GET',
    //     url: `configs/${this.selectedBranch}/d/mobile-sdks/e/${this.selectedDocID}`,
    //     onFail: () => {
    //       console.log('Error while attempting to load the Mobile SDK')
    //       this.selectedMobileSDK = null
    //       this.isDownloadLoading = false
    //     },
    //   })
    //   this.selectedMobileSDK = response?.data || {}
    //   if (this.selectedMobileSDK) {
    //     this.selectedMobileSDK.signatures = _.sortBy(this.selectedMobileSDK.signatures, (signature) => {
    //       return !signature.active
    //     }) || []
    //     if (this.selectedMobileSDK.active_config) {
    //       this.selectedMobileSDK.active_config = this.selectedMobileSDK.active_config.map((activeConfig) => ({
    //         ...activeConfig,
    //         json: JSON.stringify(JSON.parse(activeConfig.json), null, 2),
    //       }))
    //     }
    //   }
    //   this.isDownloadLoading = false
    //   this.setLoadingDocStatus(false)
    // },

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

    async loadReferencedMobileSDKsIDs() {
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/sites/`,
      })
      const serverGroups = response?.data || []
      const referencedMobileSDKs: string[] = []
      _.forEach(serverGroups, (serverGroup) => {
        referencedMobileSDKs.push(serverGroup['mobile_sdk'])
      })
      this.referencedIDsMobileSDK = _.uniq(referencedMobileSDKs)
    },
  },
  async created() {
    await this.branchesStore.list
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
