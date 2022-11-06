<template>
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
                       @change="emitToDocAndDocMatchUpdate"
                       v-model="localDoc.active">
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
                                v-model="localDoc.description"
                                @input="emitDocUpdate"
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
                     @change="emitDocUpdate"
                     v-model="localDoc.threshold">
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Time Frame
            </label>
            <div class="control suffix seconds-suffix">
              <input class="input is-small document-timeframe"
                     data-qa="dynamic-rules-timeframe-input"
                     type="number"
                     title="Dynamic Rule limit duration"
                     placeholder="Dynamic Rule limit duration"
                     @change="emitDocUpdate"
                     v-model="(localDoc.timeframe)">
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Custom Response
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="localGlobalFilterDoc.action"
                        @change="emitDocUpdate"
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
                     @change="emitDocUpdate"
                     v-model="localDoc.ttl">
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
                                      v-model="selectedDocTags"
                                      @value-changed="selectedDocTags = $event" />
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
    </div>
    <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
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
} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosResponse} from 'axios'


export default defineComponent({
  name: 'DynamicRulesEditor',
  props: {
    selectedDoc: Object,
    selectedDocMatchingGlobalFilter: Object,
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
    }
  },
  watch: {
    selectedDoc: {
      handler: function(val, oldVal) {
        if (!val || !oldVal || val.target !== oldVal.target) {
          if (this.isTargetArgsCookiesHeaders(this.localDoc.target)) {
            this.targetType = val.target.split('_')[0] || ''
            this.targetValue = val.target.split('_')[1] || ''
          } else {
            this.targetType = this.localDoc.target
            this.targetValue = ''
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    localDoc(): DynamicRule {
      return _.cloneDeep(this.selectedDoc as DynamicRule)
    },

    localGlobalFilterDoc(): GlobalFilter {
      return _.cloneDeep(this.selectedDocMatchingGlobalFilter as GlobalFilter)
    },

    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['include'], doc['exclude'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      return _.fromPairs(_.zip(dupTags, dupTags))
    },

    selectedDocTags: {
      get: function(): string {
        if (this.localGlobalFilterDoc.tags && this.localGlobalFilterDoc.tags.length > 0) {
          return this.localGlobalFilterDoc.tags.join(' ')
        }
        this.$emit('tags-invalid', true)
        return ''
      },
      set: function(tags: string): void {
        this.localGlobalFilterDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        if (tags.trim() == '' || tags.length < 3) {
          this.$emit('tags-invalid', true)
        } else {
          this.$emit('tags-invalid', false)
        }
        this.emitMatchDocUpdate()
      },
    },
  },
  emits: ['update:selectedDoc', 'update:selectedDocMatchingGlobalFilter', 'tags-invalid'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitMatchDocUpdate() {
      this.$emit('update:selectedDocMatchingGlobalFilter', this.localGlobalFilterDoc)
    },

    emitToDocAndDocMatchUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
      this.localGlobalFilterDoc.active = this.localDoc.active
      this.$emit('update:selectedDocMatchingGlobalFilter', this.localGlobalFilterDoc)
    },

    targetChanged() {
      if (this.isTargetArgsCookiesHeaders(this.targetType)) {
        this.localDoc.target = `${this.targetType}_${this.targetValue}`
      } else {
        this.localDoc.target = this.targetType
      }
      this.emitDocUpdate()
    },

    isTargetArgsCookiesHeaders(target: string): boolean {
      return (new RegExp('(arguments|cookies|headers)')).test(target)
    },

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
