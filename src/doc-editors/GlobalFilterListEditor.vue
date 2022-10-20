<template>
  <div class="card-content">
    <div class="content">
      <div class="columns columns-divided">
        <div class="column is-3">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Rule id">
                  {{ localDoc.id }}
                </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     data-qa="list-name-input"
                     title="List name"
                     placeholder="List name"
                     @change="emitDocUpdate"
                     v-model="localDoc.name"
                     :disabled="reblazeManaged || dynamicRuleManaged"/>
            </div>
            <p class="subtitle is-7 has-text-grey entries-entries-display">
              {{ sectionsEntriesDisplay }}
            </p>
          </div>
          <div class="field">
            <label class="checkbox is-size-7">
              <input type="checkbox"
                     :style="(reblazeManaged || dynamicRuleManaged) ? {cursor: 'not-allowed'} : {cursor: 'pointer'}"
                     data-qa="active-checkbox"
                     class="document-active"
                     :disabled="reblazeManaged || dynamicRuleManaged"
                     @change="emitDocUpdate"
                     v-model="localDoc.active">
              Active
            </label>
          </div>
          <div class="field">
            <div class="control"
                 v-if="editable">
              <label class="label is-small">Sections Relation</label>
              <div class="tags has-addons mb-0 document-entries-relation"
                   tabindex="0"
                   @keypress.space.prevent
                   @keypress.space="toggleRuleRelation()"
                   @keypress.enter="toggleRuleRelation()">
                  <span class="tag pointer mb-0"
                        data-qa="relation-toggle"
                        :style="(reblazeManaged || dynamicRuleManaged) ? {cursor: 'not-allowed'} : {cursor: 'pointer'}"
                        :class="localDoc.rule.relation === 'AND' ? 'is-info xis-light is-selected' : ''"
                        @click="setRuleRelation('AND')">
                    AND
                  </span>
                <span class="tag pointer mb-0"
                      :style="(reblazeManaged || dynamicRuleManaged) ? {cursor: 'not-allowed'} : {cursor: 'pointer'}"
                      :class="localDoc.rule.relation === 'OR' ? 'is-info xis-light is-selected' : ''"
                      @click="setRuleRelation('OR')">
                    OR
                  </span>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">Tags</label>
            <div class="control"
                 data-qa="tag-input">
              <tag-autocomplete-input :initial-tag="selectedDocTags"
                                      :selection-type="'multiple'"
                                      :editable="editable"
                                      @tag-changed="selectedDocTags = $event">
              </tag-autocomplete-input>
            </div>
          </div>
          <div class="field">
            <a v-if="externalSource"
               class="is-small has-text-grey is-size-7 is-pulled-right update-now-button"
               data-qa="update-now-btn"
               tabindex="0"
               disabled="dynamicRuleManaged"
               @click="fetchList"
               @keypress.space.prevent
               @keypress.space="fetchList"
               @keypress.enter="fetchList">
              Update now
            </a>
            <label class="label is-small">Source</label>
            <div class="control">
              <input class="input is-small document-source"
                     data-qa="source-input"
                     title="List source"
                     placeholder="List source"
                     @change="emitDocUpdate"
                     v-model="localDoc.source"
                     :disabled="reblazeManaged || dynamicRuleManaged"/>
            </div>
            <p class="help"
               v-if="externalSource && !dynamicRuleManaged"
               :title="fullFormattedModifiedDate">
              Updated @ {{ formattedModifiedDate }}
            </p>
          </div>
          <div class="field">
            <div class="field">
              <label class="label is-small">
                Action
              </label>
              <div class="control is-expanded">
                <div class="select is-fullwidth is-small">
                  <select v-model="localDoc.action"
                          @change="emitDocUpdate"
                          data-qa="action-dropdown"
                          class="document-action-selection"
                          :defaultValue="localDoc.action"
                          :disabled="dynamicRuleManaged"
                          title="Action">
                    <option v-for="customResponse in customResponseNames"
                            :value="customResponse[0]"
                            :key="customResponse[0]">
                      {{ customResponse[1] }}
                    </option>
                  </select>
                </div>
              </div>
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
                          :disabled="dynamicRuleManaged"
                          rows="5">
                </textarea>
            </div>
          </div>
          <div class="pt-6">
            <div class="field"
                 v-if="selfManaged">
              <div class="control is-expanded">
                <button class="button is-small has-text-danger-dark remove-all-entries-button"
                        data-qa="remove-all-entries-btn"
                        :disabled="dynamicRuleManaged"
                        title="Remove all entries"
                        @click="removeAllEntries">
                  Clear all entries
                </button>
              </div>
            </div>
          </div>

        </div>
        <div class="column is-9">
          <entries-relation-list v-model:rule="localDoc.rule"
                                 :editable="editable"
                                 ref="entriesRelationList"
                                 @update:rule="emitDocUpdate"
                                 @invalid="emitFormInvalid">
          </entries-relation-list>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter">{{ apiPath }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import EntriesRelationList from '@/components/EntriesRelationList.vue'
import {defineComponent} from 'vue'
import {Category, CustomResponse, GlobalFilter, GlobalFilterSection, GlobalFilterSectionEntry, Relation} from '@/types'
import {AxiosResponse} from 'axios'
import DateTimeUtils from '@/assets/DateTimeUtils'

export default defineComponent({
  name: 'GlobalFilterListEditor',

  components: {
    EntriesRelationList,
    TagAutocompleteInput,
  },

  props: {
    selectedBranch: String,
    selectedDoc: Object,
    apiPath: String,
    docs: Array,
  },

  data() {
    return {
      customResponseNames: [] as [CustomResponse['id'], CustomResponse['name']][],
    }
  },

  watch: {
    selectedDoc: {
      handler: function(val, oldVal) {
        if (!val || !oldVal || val.id !== oldVal.id) {
          this.$refs.entriesRelationList?.cancelAllEntries()
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    sectionsEntriesDisplay(): string {
      const sectionsCounter = (this.localDoc.rule?.entries?.length !== 1) ? 'sections' : 'section'
      const entriesCounter = (this.localDocTotalEntries !== 1) ? 'entries' : 'entry'
      const sectionsLength = this.localDoc.rule?.entries?.length
      return `${sectionsLength} ${sectionsCounter}\t|\t${this.localDocTotalEntries} ${entriesCounter}`
    },

    reblazeManaged(): boolean {
      return this.localDoc.source === 'reblaze-managed'
    },
    dynamicRuleManaged(): boolean {
      return this.selectedDoc.id ? this.selectedDoc.id.startsWith('dr_') : false
    },

    editable(): boolean {
      return this.selfManaged && !this.dynamicRuleManaged
    },

    selfManaged(): boolean {
      return this.localDoc.source === 'self-managed'
    },

    externalSource(): boolean {
      return this.localDoc.source?.indexOf('http') === 0
    },

    selectedDocTags: {
      get: function(): string {
        if (this.localDoc.tags && this.localDoc.tags.length > 0) {
          return this.localDoc.tags.join(' ')
        }
        return ''
      },
      set: function(tags: string): void {
        if (this.localDoc.id.startsWith('dr_')) {
          return
        }
        this.localDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        this.emitDocUpdate()
      },
    },

    localDoc(): GlobalFilter {
      return _.cloneDeep(this.selectedDoc as GlobalFilter)
    },

    localDocTotalEntries(): number {
      let totalEntries = 0
      if (this.localDoc.rule?.entries?.length) {
        totalEntries = _.sumBy(this.localDoc.rule.entries, (section: GlobalFilterSection) => {
          return section.entries?.length || 0
        })
      }
      return totalEntries
    },

    formattedModifiedDate(): string {
      return this.localDoc.mdate ? DateTimeUtils.isoToNowCuriefenseFormat(this.localDoc.mdate) : 'N/A'
    },

    fullFormattedModifiedDate(): string {
      return this.localDoc.mdate ? DateTimeUtils.isoToNowFullCuriefenseFormat(this.localDoc.mdate) : 'N/A'
    },
  },

  emits: ['update:selectedDoc', 'form-invalid'],

  methods: {

    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitFormInvalid(isFormInvalid: boolean) {
      this.$emit('form-invalid', isFormInvalid)
    },

    setRuleRelation(relation: Relation) {
      if (!this.dynamicRuleManaged) {
        this.localDoc.rule.relation = relation
        this.emitDocUpdate()
      }
    },

    toggleRuleRelation(): void {
      this.localDoc.rule.relation === 'AND' ? this.setRuleRelation('OR') : this.setRuleRelation('AND')
    },

    removeAllEntries() {
      this.localDoc.rule.entries.splice(0, this.localDoc.rule.entries.length)
      this.$refs.entriesRelationList?.cancelAllEntries()
      this.emitDocUpdate()
    },

    tryMatch(data: string, regex: RegExp, type: Category): GlobalFilterSectionEntry[] {
      let matches
      const entries = []
      matches = regex.exec(data)
      while (matches) {
        const entry: GlobalFilterSectionEntry = [type, matches[1], null]
        if (matches.length > 2 && matches.slice(-1)[0]) {
          entry[2] = (matches.slice(-1)[0]).slice(1, 128)
        }
        entries.push(entry)
        matches = regex.exec(data)
      }
      return entries
    },

    fetchList() {
      const lineMatchingIP =
          /^((((\d{1,3})\.){3}\d{1,3}(\/\d{1,2})?)|([0-9a-f]+:+){1,8}([0-9a-f]+)?(\/\d{1,3})?)((\s+)?([#;?].+))?/gm
      const lineMatchingASN = /(as\d{3,6})((\s+)?([#;?].+))?/gmi
      const singleIP = /^((((\d{1,3})\.){3}\d{1,3}(\/\d{1,2})?)|([0-9a-f]+:+){1,8}([0-9a-f]+)?(\/\d{1,3})?)$/
      const singleASN = /(as\d{3,6})/i
      // try every node / element of String type with the regex.
      const objectParser = (data: any, store: GlobalFilterSectionEntry[]) => {
        _.each(data, (item) => {
          if (_.isArray(item) && (item.length === 2 || item.length === 3)) {
            if (_.isString(item[0]) && (item[0].toLowerCase() === 'ip' || item[0].toLowerCase() === 'asn') &&
                _.isString(item[1]) && (singleIP.test(item[1]) || singleASN.test(item[1]))) {
              const annotation = (item[2] && _.isString(item[2])) ? item[2] : null
              store.push([item[0].toLowerCase() as Category, item[1], annotation])
            } else {
              objectParser(item, store)
            }
          } else if (_.isObject(item)) {
            objectParser(item, store)
          }
          if (_.isString(item)) {
            if (singleIP.test(item)) {
              store.push(['ip', item, null])
            } else if (singleASN.test(item)) {
              store.push(['asn', item, null])
            }
          }
        })
      }
      const url = this.localDoc.source
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `tools/fetch?url=${url}`,
      }).then((response: AxiosResponse) => {
        const data = response.data
        let entries: GlobalFilterSectionEntry[]
        const convertedData = data as GlobalFilter
        if (convertedData?.rule?.entries?.length) {
          this.localDoc.rule = convertedData.rule
          this.localDoc.mdate = (new Date).toISOString()
          this.emitDocUpdate()
          return
        }
        entries = this.tryMatch(data, lineMatchingIP, 'ip')
        if (entries.length === 0) {
          entries = this.tryMatch(data, lineMatchingASN, 'asn')
        }
        if (entries.length === 0) {
          objectParser(data, entries)
        }
        if (entries.length > 0) {
          const newSection: GlobalFilterSection = {
            relation: 'OR',
            entries: entries,
          }
          this.localDoc.rule = {
            'entries': [
              newSection,
            ],
            'relation': 'OR',
          }
          this.localDoc.mdate = (new Date).toISOString()
          this.emitDocUpdate()
        }
      })
    },

    loadCustomResponses() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/actions/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<CustomResponse[]>) => {
        this.customResponseNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },
  },

  created() {
    this.loadCustomResponses()
  },
})
</script>

<style scoped
       lang="scss">
.pointer {
  cursor: pointer;
}

.tags {
  display: inline-block;
  line-height: 0;
}

</style>
