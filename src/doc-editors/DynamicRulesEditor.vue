<template>
  <section>
    <div class="card">
      <div class="card-content">
        <div class="content">
          <div class="columns columns-divided">
            <div class="column is-5">
              <div class="field">
                <label class="label is-small">
                  Name
                  <span class="has-text-grey is-pulled-right document-id"
                        title="Document id">
                    {{ localDoc.id }}
                  </span>
                </label>
                <div class="control">
                  <input class="input is-small document-name"
                         data-qa="dynamic-rules-name-input"
                         title="Document name"
                         placeholder="Document name"
                         @change="emitDocUpdate"
                         v-model="localDoc.name"/>
                </div>
                <div class="field">
              <label class="checkbox is-size-7">
                <input type="checkbox"
                       data-qa="active-checkbox"
                       class="document-active"
                       @change="emitDocUpdate"
                       v-model="localDoc.active">
                Active
              </label>
            </div>
              </div>
              <div class="field textarea-field">
                <label class="label is-small">Description</label>
                <div class="control">
                  <textarea class="is-small textarea document-description"
                            data-qa="description-input"
                            title="Document description"
                            v-model="localDoc.description"
                            @input="emitDocUpdate"
                            rows="5">
                  </textarea>
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Time Frame
                </label>
                <div class="control suffix seconds-suffix">
                  <input class="input is-small document-timeframe"
                         data-qa="dynamic-rules-timeframe-input"
                         type="text"
                         title="Dynamic Rules limit duration"
                         placeholder="Rate limit duration"
                         @change="emitDocUpdate"
                         v-model="localDoc.timeframe">
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Thresholds
                </label>
                <div class="control">
                  <input class="input is-small document-threshold"
                         data-qa="dynamic-rules-threshold-input"
                         type="text"
                         title="Dynamic Rules threshold"
                         placeholder="Dynamic Rules Threshold"
                         @change="emitDocUpdate"
                         v-model="localDoc.thresholds">
                </div>
              </div>

              <div class="field">
                    <label class="label is-small">
                      Action
                    </label>
                    <div class="control">
                      <input class="input is-small document-action"
                             title="Action"
                             data-qa="action-input"
                             placeholder="Action"
                             @change="saveToGlobalFilters"
                             v-model="matchingGlobalFilterDoc.action"/>
                    </div>
                </div>
              <div class="field">
                <label class="label is-small">Tags</label>
                <div class="control"
                     data-qa="tag-input">
                  <tag-autocomplete-input :initial-tag="matchingDocTags"
                                          :selection-type="'multiple'"
                                          @tag-changed="matchingDocTags = $event">
                  </tag-autocomplete-input>
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
                    <tr v-for="(tag, tagIndex) in localDoc[filter]"
                        :key="tagIndex">
                      <td class="tag-cell ellipsis"
                          :class=" duplicateTags[tag] ? 'has-text-danger' : '' "
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
                                                @tag-submitted="addNewTag(filter, $event)">
                        </tag-autocomplete-input>
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
        </div>
      </div>
    </div>
  </section>
</template>
// @go-to-route="emitGoToRoute"
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {
  Dictionary,
  DynamicRule,
  IncludeExcludeType,
} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
// import RequestsUtils from '@/assets/RequestsUtils'


type MatchingGlobalFilterDoc = {
  id: string,
  action: string,
  tags: string[],
}


export default defineComponent({
  name: 'DynamicRulesEditor',
  props: {
    selectedDoc: Object,
    selectedBranch: String,
    apiPath: String,
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
      matchingGlobalFilterDoc: null as MatchingGlobalFilterDoc,
    }
  },
  // watch: {
  //   selectedDoc: {
  //     handler: function(val, oldVal) {
  //       if (!val || !oldVal || val.id !== oldVal.id) {
  //        RequestsUtils.sendRequest({

  //        })
  //       }
  //     },
  //     immediate: true,
  //     deep: true,
  //   },
  // },
  computed: {
    localDoc(): DynamicRule {
      return _.cloneDeep(this.selectedDoc as DynamicRule)
    },
    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['include'], doc['exclude'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      return _.fromPairs(_.zip(dupTags, dupTags))
    },
    matchingDocTags: {
      get: function(): string {
        if (this.matchingGlobalFilterDoc.tags && this.matchingGlobalFilterDoc.tags.length > 0) {
          return this.matchingGlobalFilterDoc.tags.join(' ')
        }
        return ''
      },
      set: function(tags: string): void {
        this.matchingGlobalFilterDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        this.saveToGlobalFilters()
      },
    },
  },
  emits: ['update:selectedDoc', 'go-to-route'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
    emitGoToRoute(url: string) {
      this.$emit('go-to-route', url)
    },

    getGlobalFilterData() {
      // const methodName = 'GET'
      // const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${this.selectedDoc.id}/`
      // const successMessage = `Get GlobalFilters Data Successfuly.`
      // const failureMessage = `Failed to get GlobalFilters data.`

      // const response = RequestsUtils.sendRequest({methodName, url, config: {headers: {'x-fields': 'id, action, tags'}},
      //  successMessage, failureMessage})

      // console.log('getGlobalFilterData response: ', response)
      this.matchingGlobalFilterDoc = {
        id: `dr_${this.selectedDoc.id}`,
        action: 'monitor', // response.data.action ||
        tags: ['trusted'], // response.data.tags ||
      }

      if (!this.matchingGlobalFilterDoc) {
        this.matchingGlobalFilterDoc = {
          id: `dr_${this.selectedDoc.id}`,
          action: 'monitor',
          tags: ['trusted'],
        }
      }
      console.log('this.matchingGlobalFilterDoc', this.matchingGlobalFilterDoc)
    },


    saveToGlobalFilters() {
      // const successMessage = `Changes to GlobalFilters were saved.`
      // const failureMessage = `Failed to save changes to GlobalFilters.`
      // const data = this.matchingGlobalFilterDoc
      console.log('saveToGlobalFilters TODO later')
      // const url = `configs/${this.selectedBranch}/d/globalfilters/e/${data.id}/`
      // RequestsUtils.sendRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      // .then(() => {}
    },
    // addThreshold() {
    //   this.localDoc.thresholds.push({limit: 0, action: 'default'} as ThresholdActionPair)
    //   this.emitDocUpdate()
    // },

    // removeThreshold(index: number) {
    //   if (this.localDoc.thresholds.length > 1) {
    //     this.localDoc.thresholds.splice(index, 1)
    //   }
    //   this.emitDocUpdate()


    addNewTag(section: IncludeExcludeType, entry: string) {
      if (entry && entry.length > 2) {
        this.localDoc[section].push(entry)
        this.emitDocUpdate()
      }
    },

    openTagInput(section: IncludeExcludeType) {
      this.addNewTagColName = section
    },

    cancelAddNewTag() {
      this.addNewTagColName = null
    },

    removeTag(section: IncludeExcludeType, index: number) {
      this.localDoc[section].splice(index, 1)
      this.addNewTagColName = null
      this.emitDocUpdate()
    },
  },

  created() {
    this.getGlobalFilterData()
  },
})
</script>

<style scoped lang="scss">

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
