<template>
  <div class="card-content">
    <div class="content">
      <div class="card collapsible-card"
           :class="{ collapsed: isDataCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible px-5 py-5 mb-0"
               @click="isDataCollapsed = !isDataCollapsed">
            <div class="media-content">
              <p v-show="isDataCollapsed"
                 class="is-5">
                <span class="inline-collapsed-header">
                  <span class="label is-small mr-1">
                    Name:
                  </span>
                  {{ localDoc.name }}
                </span>
                <span class="inline-collapsed-header">
                  <span class="label is-small mr-1">
                    ID:
                  </span>
                  {{ localDoc.id }}
                </span>
                <span class="inline-collapsed-header">
                  <span class="label is-small mr-1">
                    Tags:
                  </span>
                  {{ selectedDocTags }}
                </span>
              </p>
            </div>
            <span v-show="isDataCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isDataCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-5 py-5">
            <div class="columns">
              <div class="column is-4">
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
                </div>
                <div class="field">
                  <label class="checkbox is-size-7">
                    <input type="checkbox"
                           :style="dynamicRuleManaged ? {cursor: 'not-allowed'} : {cursor: 'pointer'}"
                           data-qa="active-checkbox"
                           class="document-active"
                           :disabled="dynamicRuleManaged"
                           @change="emitDocUpdate"
                           v-model="localDoc.active">
                    Active
                  </label>
                </div>
                <div class="field">
                  <label class="label is-small">Tags</label>
                  <div class="control"
                       data-qa="tag-input">
                    <tag-autocomplete-input :initial-tag="selectedDocTags"
                                            selection-type="multiple"
                                            :editable="!dynamicRuleManaged"
                                            @tag-changed="selectedDocTags = $event"/>
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
                      Custom Response
                    </label>
                    <div class="control is-expanded">
                      <div class="select is-fullwidth is-small">
                        <select v-model="localDoc.action"
                                @change="emitDocUpdate"
                                data-qa="action-dropdown"
                                class="document-action-selection"
                                :defaultValue="localDoc.action"
                                :disabled="dynamicRuleManaged"
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
                                rows="2">
                      </textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-12">
          <div class="field">
            <label class="label is-small">Rule</label>
            <entries-relation-list v-model:rule="localDoc.rule"
                                   @update:rule="emitDocUpdate"
                                   @invalid="emitFormInvalid"
                                   :editable="editable">
            </entries-relation-list>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import EntriesRelationList from '@/components/EntriesRelationList.vue'
import {defineComponent} from 'vue'
import {Category, CustomResponse, GlobalFilter, GlobalFilterRuleEntry} from '@/types'
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

      // collapsed
      isDataCollapsed: true,
    }
  },

  computed: {
    reblazeManaged(): boolean {
      return this.localDoc.id.startsWith('rbz-')
    },

    dynamicRuleManaged(): boolean {
      return this.selectedDoc.id ? this.selectedDoc.id.startsWith('dr_') : false
    },

    editable(): boolean {
      return this.selfManaged && !this.dynamicRuleManaged && !this.reblazeManaged
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
        this.$emit('tags-invalid', true)
        return ''
      },
      set: function(tags: string): void {
        if (this.localDoc.id.startsWith('dr_')) {
          return
        }
        this.localDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        if (tags.trim() == '' || tags.length < 3) {
          this.$emit('tags-invalid', true)
        } else {
          this.$emit('tags-invalid', false)
        }
        this.emitDocUpdate()
      },
    },

    localDoc(): GlobalFilter {
      return _.cloneDeep(this.selectedDoc as GlobalFilter)
    },

    formattedModifiedDate(): string {
      return this.localDoc.mdate ? DateTimeUtils.isoToNowCuriefenseFormat(this.localDoc.mdate) : 'N/A'
    },

    fullFormattedModifiedDate(): string {
      return this.localDoc.mdate ? DateTimeUtils.isoToNowFullCuriefenseFormat(this.localDoc.mdate) : 'N/A'
    },
  },

  emits: ['update:selectedDoc', 'form-invalid', 'tags-invalid'],

  methods: {

    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitFormInvalid(isFormInvalid: boolean) {
      this.$emit('form-invalid', isFormInvalid)
    },

    tryMatch(data: string, regex: RegExp, type: Category): GlobalFilterRuleEntry[] {
      let matches
      const entries = []
      matches = regex.exec(data)
      while (matches) {
        const entry: GlobalFilterRuleEntry = [type, matches[1], null]
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
      const objectParser = (data: any, store: GlobalFilterRuleEntry[]) => {
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
        let entries: GlobalFilterRuleEntry[]
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
          this.localDoc.rule = {
            'entries': entries,
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

.tags {
  display: inline-block;
  line-height: 0;
}

</style>
