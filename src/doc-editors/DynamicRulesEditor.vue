<template>
  <div class="card-content">
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
                   v-if="docs.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="doc-selection"
                          :class="{'is-loading': isNewLoading}"
                          data-qa="switch-document">
                          <option v-for="doc in docs"
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
                <button class="button is-small new-dynamic-rule-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewDynamicRule()"
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
                        :disabled="!selectedDynamicRule"
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
                        :disabled="!selectedDynamicRule || !localGlobalFilterDoc || tagsInvalid"
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
         v-if="!loadingDocCounter && selectedBranch && selectedDynamicRule && localGlobalFilterDoc && docs">
      <div class="columns columns-divided">
        <div class="column is-5">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Document id">
                    {{ selectedDynamicRule.id }}
                  </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     data-qa="dynamic-rules-name-input"
                     title="Document name"
                     placeholder="Document name"
                     v-model="selectedDynamicRule.name"/>
            </div>
            <div class="field">
              <label class="checkbox is-size-7">
                <input type="checkbox"
                       data-qa="active-checkbox"
                       class="document-active"
                       v-model="selectedDynamicRule.active">
                Active
              </label>
            </div>
          </div>
          <div class="field textarea-field">
            <label class="label is-small">
              Description
            </label>
            <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedDynamicRule.description"
                                rows="2">
                      </textarea>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Target
            </label>
            <div class="control is-expanded">
              <div class="columns mb-0">
                <div class="column">
                  <div class="select is-fullwidth is-small">
                    <select v-model="targetType"
                            data-qa="target-dropdown"
                            title="Target"
                            @change="targetChanged"
                            class="target-dropdown">
                      <option v-for="option in targetOptions"
                              :key="option.key"
                              :value="option.key">
                        {{ option.title }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="column">
                  <input v-if="isTargetArgsCookiesHeaders(targetType)"
                         class="input is-small target-key-input"
                         data-qa="dynamic-rules-target-key-input"
                         title="Target key"
                         placeholder="Target key"
                         v-model="targetValue"
                         @change="targetChanged">
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Threshold
            </label>
            <div class="control">
              <input class="input is-small document-threshold"
                     data-qa="dynamic-rules-threshold-input"
                     type="number"
                     title="Dynamic Rule threshold"
                     placeholder="Dynamic Rule threshold"
                     v-model="selectedDynamicRule.threshold">
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Time Frame
            </label>
            <div class="control suffix minute-suffix">
              <input class="input is-small document-timeframe"
                     data-qa="dynamic-rules-timeframe-input"
                     type="number"
                     title="Dynamic Rule limit duration"
                     placeholder="Dynamic Rule limit duration"
                     v-model="(selectedDynamicRule.timeframe)">
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Custom Response
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="localGlobalFilterDoc.action"
                        data-qa="action-dropdown"
                        class="document-action-selection"
                        title="Custom Response">
                  <option v-for="customResponse in customResponseNames"
                          :value="customResponse[0]"
                          :key="customResponse[0]">
                    {{ customResponse[1] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Time Span
            </label>
            <div class="control suffix seconds-suffix">
              <input class="input is-small document-time-span"
                     data-qa="dynamic-rules-time-span-input"
                     type="number"
                     title="Dynamic Rule time span"
                     placeholder="Dynamic Rule time span"
                     v-model="selectedDynamicRule.ttl">
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Tags
            </label>
            <div class="control document-tags"
                 data-qa="tag-input">
              <tag-autocomplete-input :initial-tag="selectedDocTags"
                                      selection-type="multiple"
                                      @tag-changed="selectedDocTags = $event" />
            </div>
          </div>
        </div>
        <div class="column is-7">
          <div class="columns">
            <div class="column is-6 filter-column"
                 v-for="filter in filters"
                 :key="filter"
                 :class="filter + '-filter-column'">
              <p class="title is-7">
                {{ titles[filter] }}
              </p>
              <hr class="bar"
                  :class="`bar-${filter}`"/>
              <table class="table is-narrow is-fullwidth">
                <tbody>
                <tr v-for="(tag, tagIndex) in selectedDynamicRule[filter]"
                    :key="tagIndex">
                  <td class="tag-cell ellipsis"
                      :class="duplicateTags[tag] ? 'has-text-danger' : ''"
                      :title="tag">
                    {{ tag }}
                  </td>
                  <td class="is-size-7 width-20px">
                    <a title="Remove entry"
                       data-qa="remove-tag-btn"
                       class="is-small has-text-grey remove-filter-entry-button"
                       tabindex="0"
                       @click="removeTag(filter, tagIndex)"
                       @keypress.space.prevent
                       @keypress.space="removeTag(filter, tagIndex)"
                       @keypress.enter="removeTag(filter, tagIndex)">
                      &ndash;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <tag-autocomplete-input v-if="addNewTagColName === filter"
                                            ref="tagAutocompleteInput"
                                            :clear-input-after-selection="true"
                                            :selection-type="'single'"
                                            :auto-focus="true"
                                            @keydown.esc="cancelAddNewTag"
                                            @tag-submitted="addNewTag(filter, $event)"/>
                  </td>
                  <td class="is-size-7 width-20px">
                    <a title="add new entry"
                       class="is-size-7 width-20px is-small has-text-grey add-new-filter-entry-button"
                       tabindex="0"
                       @click="openTagInput(filter)"
                       @keypress.space.prevent
                       @keypress.space="openTagInput(filter)"
                       @keypress.enter="openTagInput(filter)">
                      +
                    </a>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedDynamicRule || !docs">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <span v-if="!selectedDynamicRule?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewDynamicRule()">
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
import {defineComponent} from 'vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {
  CustomResponse,
  Dictionary,
  DynamicRule,
  GlobalFilter,
  IncludeExcludeType,
  HttpRequestMethods,
} from '@/types'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import DatasetsUtils from '@/assets/DatasetsUtils'

export default defineComponent({
  name: 'DynamicRulesEditor',
  props: {
  },
  components: {
    TagAutocompleteInput,
  },
  data() {
    return {
      filters: ['include', 'exclude'] as IncludeExcludeType[],
      titles: DatasetsUtils.titles,
      addNewTagColName: null,
      removable: false,
      targetOptions: [
        {
          key: 'arguments',
          title: 'Argument',
        },
        {
          key: 'asn',
          title: 'ASN',
        },
        {
          key: 'cookies',
          title: 'Cookie',
        },
        {
          key: 'country',
          title: 'Country',
        },
        {
          key: 'headers',
          title: 'Header',
        },
        {
          key: 'ip',
          title: 'IP',
        },
        {
          key: 'org',
          title: 'Organization',
        },
      ],
      targetType: '',
      targetValue: '',
      customResponseNames: [] as [CustomResponse['id'], CustomResponse['name']][],

      localGlobalFilterDoc: null as GlobalFilter,
      duplicatedGlobalFilter: null as GlobalFilter,
      docs: [] as unknown as DynamicRule[],
      globalFiltersDocs: [] as unknown as GlobalFilter[],
      selectedDocID: null,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isForkLoading: false,
      isNewLoading: false,
      tagsInvalid: false,

    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DynamicRules/config') && val && val !== oldVal) {
          await this.loadCustomResponses()
          await this.loadDocs()
          await this.setSelectedDataFromRouteParams()
          await this.loadGlobalFilter()
        }
      },
      immediate: true,
    },
    selectedDynamicRule: {
      handler: async function(val, oldVal) {
      // display target
        if (val && val !== oldVal) {
          if (this.selectedDynamicRule?.target.includes('_')) {
            const targets = this.selectedDynamicRule.target.split('_')
            this.targetType = targets[0]
            this.targetValue = targets[1]
          } else {
            this.targetType = this.selectedDynamicRule?.target
          }
          await this.loadGlobalFilter()
        }
      },
    },
  },
  computed: {

    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/dynamic-rules/e/${this.selectedDocID}/`
    },

    duplicateTags(): Dictionary<string> {
      const doc = this.selectedDynamicRule
      const allTags = _.concat(doc['include'], doc['exclude'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      return _.fromPairs(_.zip(dupTags, dupTags))
    },

    selectedDocTags: {
      get: function(): string {
        if (this.localGlobalFilterDoc.tags && this.localGlobalFilterDoc.tags.length > 0) {
          return this.localGlobalFilterDoc.tags.join(' ')
        }
        return ''
      },
      set: function(tags: string): void {
        this.localGlobalFilterDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        if (tags.trim() === '' || tags.length < 3) {
          this.tagsInvalid = true
        } else {
          this.tagsInvalid = false
        }
      },
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    selectedDynamicRule: {
      get(): DynamicRule {
        return this.docs[this.selectedDocIndex]
      },
      set(newDoc: DynamicRule): void {
        this.docs[this.selectedDocIndex] = newDoc
      },
    },

    selectedDocIndex(): number {
      if (this.selectedDocID && this.docs) {
        return _.findIndex(this.docs, (doc) => {
          return doc?.id === this.selectedDocID
        })
      }
      return 0
    },
  },
  methods: {

    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/dynamic-rules/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new dynamic rule document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.selectedDocID = this.$route.params?.doc_id?.toString()
      await this.loadGlobalFilter()
      this.setLoadingDocStatus(false)
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const dynamicRuleText = this.titles['dynamic-rules-singular']
      const url = `configs/${this.selectedBranch}/d/dynamic-rules/e/${this.selectedDynamicRule.id}/`
      const successMessage = `The ${dynamicRuleText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${dynamicRuleText}.`
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

    sortDocs() {
      this.docs = this.docs?.length && _.sortBy(this.docs, [(doc) => doc.name.toLowerCase()])
    },

    async loadDocs() {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const url = `configs/${this.selectedBranch}/d/dynamic-rules/`
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url,
        onFail: (error: any) => {
          console.log('Error while attempting to load documents', error)
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = (response?.data) ? _.cloneDeep(response.data) : []
      this.sortDocs()
      if (this.docs && this.docs?.length && this.docs[0]?.id) {
        if (!_.find(this.docs, (doc: DynamicRule) => {
          return doc?.id === this.selectedDocID
        })) {
          this.selectedDocID = this.docs[0].id
        }
      }
      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    newDynamicRule(): DynamicRule {
      const factory = DatasetsUtils.newDocEntryFactory['dynamic-rules']
      return factory && factory()
    },

    newGlobalFilter(): GlobalFilter {
      const factory = DatasetsUtils.newDocEntryFactory['globalfilters']
      return factory && factory()
    },

    async loadGlobalFilter() {
      this.localGlobalFilterDoc = this.globalFiltersDocs?.find((doc: any) => {
        return doc?.id === `dr_${this.selectedDocID}`
      })
      if (!this.localGlobalFilterDoc) {
        const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${this.selectedDocID}/`
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url})
        if (response?.data) {
          this.localGlobalFilterDoc = response.data
          this.globalFiltersDocs.push(this.localGlobalFilterDoc)
        }
      }
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedDynamicRule) as DynamicRule
      docToAdd.id = DatasetsUtils.generateUUID2()
      docToAdd.name = 'copy of ' + docToAdd.name + ' ' + docToAdd.id
      this.duplicatedGlobalFilter = this.localGlobalFilterDoc

      const docTypeText = this.titles['dynamic-rules-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewDynamicRule(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewDynamicRule(dynamicRuleToAdd?: DynamicRule, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true

      if (!dynamicRuleToAdd) {
        dynamicRuleToAdd = this.newDynamicRule()
        this.duplicatedGlobalFilter = this.newGlobalFilter()
        this.duplicatedGlobalFilter.id = `dr_${dynamicRuleToAdd.id}`
        this.duplicatedGlobalFilter.name = `GlobalFilter for DynamicRule ${dynamicRuleToAdd.id}`
      } else {
        this.duplicatedGlobalFilter.id = `dr_${dynamicRuleToAdd.id}`
        this.duplicatedGlobalFilter.name = `Global Filter for Dynamic Rules ${dynamicRuleToAdd.id}`
      }
      const dynamicRuleText = this.titles['dynamic-rules-singular']
      if (!successMessage) {
        successMessage = `New ${dynamicRuleText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${dynamicRuleText}.`
      }
      const data = dynamicRuleToAdd
      this.selectedDocID = dynamicRuleToAdd.id // data.id

      await this.saveChanges('POST', data, successMessage, failureMessage)
      this.docs.push(dynamicRuleToAdd)
      this.sortDocs()

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: DynamicRule | GlobalFilter,
                      successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true

      if (!methodName) {
        methodName = 'PUT'
      }

      if (!data) {
        data = this.selectedDynamicRule
        const url = `configs/${this.selectedBranch}/d/dynamic-rules/e/${data.id}/`
        const dynamicRulesText = this.titles['dynamic-rules-singular']
        if (!successMessage) {
          successMessage = `Changes to the ${dynamicRulesText} were saved.`
        }
        if (!failureMessage) {
          failureMessage = `Failed while attempting to save the changes to the ${dynamicRulesText}.`
        }
        await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})

        // globalData
        data = this.localGlobalFilterDoc
        data.active = this.selectedDynamicRule.active
        let urlGlobal = `configs/${this.selectedBranch}/d/globalfilters/e/`
        if (methodName !== 'POST') {
          urlGlobal += `${data.id}/`
        }
        // const globalFilterText = this.titles['globalfilters-singular']
        // successMessage = `Changes to the ${globalFilterText} were saved.`
        // failureMessage = `Failed while attempting to save the changes to the ${globalFilterText}.`
        await RequestsUtils.sendRequest({methodName, url: urlGlobal, data})
      } else {
        const url = `configs/${this.selectedBranch}/d/dynamic-rules/e/${data.id}/`
        const dynamicRulesText = this.titles['dynamic-rules-singular']
        if (!successMessage) {
          successMessage = `Changes to the ${dynamicRulesText} were saved.`
        }
        if (!failureMessage) {
          failureMessage = `Failed while attempting to save the changes to the ${dynamicRulesText}.`
        }
        await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
        const active = data.active
        data = this.duplicatedGlobalFilter
        data.active = active
        let urlGlobal = `configs/${this.selectedBranch}/d/globalfilters/e/`
        if (methodName !== 'POST') {
          urlGlobal += `${data.id}/`
        }
        // const globalFilterText = this.titles['globalfilters-singular']
        // successMessage = `Changes to the ${globalFilterText} were saved.`
        // failureMessage = `Failed while attempting to save the changes to the ${globalFilterText}.`
        await RequestsUtils.sendRequest({methodName, url: urlGlobal, data})
      }
      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
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
      const docName = this.docs[this.selectedDocIndex].name
      if (docName) {
        Utils.toast(
            `Switched to document ${docName} with ID "${this.selectedDocID}".`,
            'is-info',
        )
      }
      this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/dynamic-rules/list`)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('dynamic-rules', 'json', this.selectedDynamicRule)
      }
    },

    targetChanged() {
      if (this.isTargetArgsCookiesHeaders(this.targetType)) {
        this.selectedDynamicRule.target = `${this.targetType}_${this.targetValue}`
      } else {
        this.selectedDynamicRule.target = this.targetType
      }
    },

    isTargetArgsCookiesHeaders(target: string): boolean {
      return (new RegExp('(arguments|cookies|headers)')).test(target)
    },

    addNewTag(section: IncludeExcludeType, entry: string) {
      if (entry && entry.length > 2) {
        this.selectedDynamicRule[section].push(entry)
      }
    },

    openTagInput(section: IncludeExcludeType) {
      this.addNewTagColName = section
    },

    cancelAddNewTag() {
      this.addNewTagColName = null
    },

    removeTag(section: IncludeExcludeType, index: number) {
      this.selectedDynamicRule[section].splice(index, 1)
      this.addNewTagColName = null
    },

    async loadCustomResponses() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/actions/`,
        config: {headers: {'x-fields': 'id, name'}},
      })
      const customResponse = response?.data
      this.customResponseNames = _.sortBy(_.map(customResponse, (entity) => {
        return [entity.id, entity.name]
      }), (e) => {
        return e[1]
      })
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>

<style scoped
       lang="scss">

.document-active {
  margin-top: 15px;
}

.form-label {
  padding-top: 0.25rem;
}

.bar {
  margin: 1rem 0 0.5rem;
}

.seconds-suffix {
  input {
    padding-right: 60px;
  }
}

.remove-threshold-option-button {
  margin-left: auto;
  margin-top: auto;
}

.button-wrapper-column {
  display: flex;
}

.threshold-card {
  padding: 20px;
}

</style>
