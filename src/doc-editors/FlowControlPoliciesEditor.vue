<template>
  <div class="card-content">
    <div class="content">
      <div class="columns columns-divided">
        <div class="column is-5">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Flow control policy id">
                  {{ localDoc.id }}
                </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     data-qa="flowcontrol-name-input"
                     title="Flow control policy name"
                     placeholder="Flow control policy name"
                     @change="emitDocUpdate"
                     v-model="localDoc.name"/>
            </div>
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
          <div class="field">
            <label class="label is-small has-text-left form-label">
              Time Frame
            </label>
            <div class="control suffix seconds-suffix">
              <input class="input is-small document-timeframe"
                     data-qa="timeframe-input"
                     type="number"
                     title="Flow control policy duration"
                     placeholder="Flow control policy duration"
                     @change="emitDocUpdate"
                     v-model.number="localDoc.timeframe">
            </div>
          </div>
          <div class="field">
            <limit-option v-for="(option, index) in localDoc.key"
                          label-separated-line
                          :label="index === 0 ? 'Count by' : ''"
                          show-remove
                          @remove="removeKey(index)"
                          @change="updateKeyOption($event, index)"
                          :ignore-attributes="['securitypolicyid', 'securitypolicyentryid']"
                          :removable="localDoc.key.length > 1"
                          :index="index"
                          :option="generateOption(option)"
                          :key="getOptionTextKey(option, index)"/>
            <a title="Add new option rule"
               class="is-text is-small is-size-7 ml-3 add-key-button"
               data-qa="add-new-key-btn"
               tabindex="0"
               @click="addKey()"
               @keypress.space.prevent
               @keypress.space="addKey()"
               @keypress.enter="addKey()">
              New entry
            </a>
            <p class="has-text-danger is-size-7 ml-3 mt-3 key-invalid"
               v-if="!keysAreValid">
              Count-by entries must be unique
            </p>
          </div>
          <div class="field">
            <label class="label is-small">Tags</label>
            <div class="control"
                 data-qa="tag-input">
              <tag-autocomplete-input :initial-tag="selectedDocTags"
                                      selection-type="multiple"
                                      @tag-changed="selectedDocTagsChanged" />
            </div>
            <labeled-tags title="Automatic Tags"
                          :tags="automaticTags" />
          </div>
          <div class="field textarea-field">
            <label class="label is-small">Description</label>
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
          <div class="columns filter-columns">
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
                    <a title="remove entry"
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
                                            @tag-submitted="addNewTag(filter, $event)" />
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
        <div class="column is-7">
          <div class="sequence-wrapper">
            <div v-for="(sequenceItem, sequenceIndex) in localDoc.sequence"
                 :key="sequenceIndex"
                 class="sequence">
              <div class="sequence-entries">
                <table class="table is-narrow is-size-7 sequence-entries-table">
                  <tbody>
                  <tr class="sequence-entry-row method-entry-row">
                    <td class="is-size-7 width-50px sequence-entries-relation"></td>
                    <td class="width-80px is-vcentered">
                      Method
                    </td>
                    <td colspan="2">
                      <div class="select is-small is-fullwidth">
                        <select v-model="sequenceItem.method"
                                data-qa="method-dropdown"
                                title="Method"
                                class="select method-entry-input"
                                @change="emitDocUpdate">
                          <option v-for="method in httpRequestMethods"
                                  :key="method"
                                  :value="method">
                            {{ method }}
                          </option>
                        </select>
                      </div>
                    </td>
                    <td class="width-80px"></td>
                  </tr>
                  <tr class="sequence-entry-row host-entry-row">
                    <td class="is-size-7 width-50px has-text-centered is-vcentered has-text-grey-light
                                 has-text-weight-medium sequence-entries-relation">
                      AND
                    </td>
                    <td class="width-80px is-vcentered">
                      Host
                    </td>
                    <td colspan="2">
                      <div class="control is-fullwidth">
                        <input class="input is-small host-entry-input"
                               data-qa="host-input"
                               title="Host"
                               v-model="sequenceItem.headers.host"
                               @input="emitDocUpdate"/>
                      </div>
                    </td>
                    <td class="width-80px"></td>
                  </tr>
                  <tr class="sequence-entry-row uri-entry-row">
                    <td class="is-size-7 width-50px has-text-centered is-vcentered has-text-grey-light
                                 has-text-weight-medium sequence-entries-relation">
                      AND
                    </td>
                    <td class="width-80px is-vcentered">
                      Path
                    </td>
                    <td colspan="2">
                      <div class="control is-fullwidth">
                        <input class="input is-small uri-entry-input"
                               data-qa="path-input"
                               title="Path"
                               v-model="sequenceItem.uri"
                               @input="emitDocUpdate"/>
                      </div>
                    </td>
                    <td class="width-80px"></td>
                  </tr>
                  <tr v-for="(sequenceEntry, sequenceEntryIndex) in sequenceItemEntries(sequenceIndex)"
                      :key="sequenceEntryIndex"
                      class="sequence-entry-row">
                    <td class="is-size-7 width-50px has-text-centered is-vcentered has-text-grey-light
                                 has-text-weight-medium sequence-entries-relation">
                      AND
                    </td>
                    <td class="width-80px is-vcentered">
                      {{ getListEntryTitle(sequenceEntry[0]) }}
                    </td>
                    <td class="width-100px">
                      {{ (sequenceEntry[1][0]) }}
                    </td>
                    <td>
                      {{ (sequenceEntry[1][1]) }}
                    </td>
                    <td class="width-80px">
                      <a class="is-small has-text-grey remove-entry-button"
                         data-qa="remove-sequence-btn"
                         title="Remove sequence entry"
                         tabindex="0"
                         @click="removeSequenceItemEntry(
                                sequenceIndex, sequenceEntry[0], sequenceEntry[1][0])"
                         @keypress.space.prevent
                         @keypress.space="removeSequenceItemEntry(
                                sequenceIndex, sequenceEntry[0], sequenceEntry[1][0])"
                         @keypress.enter="removeSequenceItemEntry(
                                sequenceIndex, sequenceEntry[0], sequenceEntry[1][0])">
                        remove
                      </a>
                    </td>
                  </tr>
                  <tr v-if="newEntrySectionIndex !== sequenceIndex">
                    <td colspan="5">
                      <a class="is-size-7 has-text-grey-lighter add-button add-entry-button"
                         data-qa="add-new-row-btn"
                         title="add new row"
                         tabindex="0"
                         @click="setNewEntryIndex(sequenceIndex)"
                         @keypress.space.prevent
                         @keypress.space="setNewEntryIndex(sequenceIndex)"
                         @keypress.enter="setNewEntryIndex(sequenceIndex)">
                        <i class="fas fa-plus"></i></a>
                      &nbsp;&middot;&nbsp;
                      <a class="is-size-7 has-text-grey-lighter remove-button remove-section-button"
                         title="remove entire section"
                         tabindex="0"
                         @click="removeSequenceItem(sequenceIndex)"
                         @keypress.space.prevent
                         @keypress.space="removeSequenceItem(sequenceIndex)"
                         @keypress.enter="removeSequenceItem(sequenceIndex)">
                        <i class="fas fa-trash"></i></a>
                    </td>
                  </tr>
                  <tr v-if="newEntrySectionIndex === sequenceIndex"
                      class="new-entry-row">
                    <td class="is-size-7"
                        colspan="2">
                      <div class="select is-small is-fullwidth">
                        <select v-model="newEntryType"
                                title="New entry type"
                                class="select new-entry-type-selection">
                          <option v-for="(entryType, category) in listEntryTypes"
                                  :key="category"
                                  :value="category">
                            {{ entryType.title }}
                          </option>
                        </select>
                      </div>
                    </td>
                    <td class="is-size-7 width-100px">
                      <div class="control has-icons-left is-fullwidth new-entry-name">
                        <input class="input is-small new-entry-name-input"
                               title="Name"
                               placeholder="Name"
                               v-model="newEntryItem.name"/>
                        <span class="icon is-small is-left has-text-grey-light"><i class="fa fa-code"></i></span>
                      </div>
                    </td>
                    <td class="is-size-7">
                      <div class="control has-icons-left is-fullwidth new-entry-value">
                        <input class="input is-small new-entry-value-input"
                               title="Value"
                               placeholder="Value"
                               v-model="newEntryItem.value"/>
                        <span class="icon is-small is-left has-text-grey-light"><i class="fa fa-code"></i></span>
                      </div>
                    </td>
                    <td class="is-size-7 width-80px">
                      <a class="is-size-7 has-text-grey add-button confirm-add-entry-button"
                         title="add new row"
                         tabindex="0"
                         @click="addSequenceItemEntry(sequenceIndex)"
                         @keypress.space.prevent
                         @keypress.space="addSequenceItemEntry(sequenceIndex)"
                         @keypress.enter="addSequenceItemEntry(sequenceIndex)">
                        <i class="fas fa-check"></i> Add
                      </a>
                      <br/>
                      <a class="is-size-7 has-text-grey remove-button"
                         title="cancel add new row"
                         tabindex="0"
                         @click="setNewEntryIndex(-1)"
                         @keypress.space.prevent
                         @keypress.space="setNewEntryIndex(-1)"
                         @keypress.enter="setNewEntryIndex(-1)">
                        <i class="fas fa-times"></i> Cancel
                      </a>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="localDoc.sequence.length > 1 && sequenceIndex !== localDoc.sequence.length - 1"
                   class="control is-expanded relation-wrapper">
                  <span class="tag is-small is-relative">
                    THEN
                  </span>
              </div>
            </div>
            <button class="button is-small new-sequence-button"
                    data-qa="new-sequence-btn"
                    @click="addSequenceItem()">
              Create new sequence section
            </button>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import LimitOption, {OptionObject} from '@/components/LimitOption.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {defineComponent} from 'vue'
import {
  ArgsCookiesHeadersType,
  Dictionary,
  FlowControlPolicy,
  IncludeExcludeType,
  LimitOptionType,
  LimitRuleType,
} from '@/types'
import {httpRequestMethods} from '@/types/const'
import LabeledTags from '@/components/LabeledTags.vue'


export default defineComponent({
  name: 'FlowControlPolicy',

  props: {
    selectedDoc: Object,
    apiPath: String,
  },

  components: {
    LabeledTags,
    LimitOption,
    TagAutocompleteInput,
  },

  data() {
    return {
      filters: ['include', 'exclude'] as IncludeExcludeType[],
      addNewTagColName: null,
      titles: DatasetsUtils.titles,
      defaultSequenceItem: {...DatasetsUtils.defaultFlowControlSequenceItem},
      listEntryTypes: {
        'headers': {title: 'Header', pair: true},
        'args': {title: 'Argument', pair: true},
        'cookies': {title: 'Cookie', pair: true},
      },
      keysAreValid: true,
      newEntrySectionIndex: -1,
      newEntryType: 'args' as ArgsCookiesHeadersType,
      newEntryItem: {
        name: '',
        value: '',
      },
      httpRequestMethods,
    }
  },

  computed: {
    localDoc(): FlowControlPolicy {
      return _.cloneDeep(this.selectedDoc as FlowControlPolicy)
    },

    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['include'], doc['exclude'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      return _.fromPairs(_.zip(dupTags, dupTags))
    },

    selectedDocTags: {
      get: function(): string {
        if (this.localDoc.tags && this.localDoc.tags.length > 0) {
          return this.localDoc.tags.join(' ')
        }
        return ''
      },
      set: function(tags: string): void {
        this.localDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        this.emitDocUpdate()
      },
    },

    automaticTags(): string[] {
      const idTag = `fc-id:${this.localDoc.id?.replace(/ /g, '-') || ''}`
      const nameTag = `fc-name:${this.localDoc.name?.replace(/ /g, '-') || ''}`
      return [idTag, nameTag]
    },
  },

  emits: ['update:selectedDoc', 'form-invalid'],

  methods: {
    getListEntryTitle(seqEntry: ArgsCookiesHeadersType): ArgsCookiesHeadersType {
      return this.listEntryTypes[seqEntry].title as ArgsCookiesHeadersType
    },

    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitFormInvalid(isFormInvalid: boolean) {
      this.$emit('form-invalid', isFormInvalid)
    },

    // Key

    getOptionTextKey(option: LimitOptionType, index: number): string {
      const [type] = Object.keys(option)
      return `${this.localDoc.id}_${type}_${index}`
    },

    generateOption(data: LimitOptionType): OptionObject {
      const [firstObjectKey] = Object.keys(data)
      const type = firstObjectKey as LimitRuleType
      const key = (data[firstObjectKey] || null)
      return {type, key, value: null}
    },

    addKey() {
      this.localDoc.key.push({attrs: 'ip'})
      this.emitDocUpdate()
      this.checkKeysValidity()
    },

    removeKey(index: number) {
      if (this.localDoc.key.length > 1) {
        this.localDoc.key.splice(index, 1)
      }
      this.emitDocUpdate()
      this.checkKeysValidity()
    },

    updateKeyOption(option: OptionObject, index: number) {
      this.localDoc.key.splice(index, 1, {
        [option.type]: option.key,
      })
      this.emitDocUpdate()
      this.checkKeysValidity()
    },

    checkKeysValidity(): boolean {
      const keysToCheck = _.countBy(this.localDoc.key, (item) => {
        const key = Object.keys(item)[0]
        return `${key}_${item[key]}`
      })
      this.keysAreValid = true
      for (const key of Object.keys(keysToCheck)) {
        if (keysToCheck[key] > 1) {
          this.keysAreValid = false
          break
        }
      }
      return this.keysAreValid
    },

    // Sequence

    setNewEntryIndex(index: number) {
      this.newEntryItem = {
        name: '',
        value: '',
      }
      this.newEntryType = 'args'
      this.newEntrySectionIndex = index
    },

    sequenceItemEntries(sequenceIndex: number): (string | any[])[] {
      const sequenceItem = this.localDoc.sequence[sequenceIndex]
      const headersEntries = Object.entries(sequenceItem.headers) as string | any[]
      const cookiesEntries = Object.entries(sequenceItem.cookies) as string | any[]
      const argsEntries = Object.entries(sequenceItem.args) as (string | any[])
      const mergedEntries = []
      for (let i = 0; i < headersEntries.length; i++) {
        if (headersEntries[i][0] !== 'host') {
          mergedEntries.push(['headers', headersEntries[i]] as ArgsCookiesHeadersType | any[])
        }
      }
      for (let i = 0; i < argsEntries.length; i++) {
        mergedEntries.push(['args', argsEntries[i]] as ArgsCookiesHeadersType | any[])
      }
      for (let i = 0; i < cookiesEntries.length; i++) {
        mergedEntries.push(['cookies', cookiesEntries[i]] as ArgsCookiesHeadersType | any[])
      }
      return mergedEntries
    },

    addSequenceItem() {
      if (this.localDoc.sequence.length > 0) {
        const firstSequenceItem = this.localDoc.sequence[0]
        this.defaultSequenceItem.headers.host = firstSequenceItem.headers.host
      }
      this.localDoc.sequence.push(this.defaultSequenceItem)
      this.emitDocUpdate()
    },

    removeSequenceItem(sequenceIndex: number) {
      this.localDoc.sequence.splice(sequenceIndex, 1)
      this.emitDocUpdate()
    },

    addSequenceItemEntry(sequenceIndex: number) {
      const sequenceItem = this.localDoc.sequence[sequenceIndex]
      const newEntryName = this.newEntryItem.name.trim().toLowerCase()
      const newEntryValue = this.newEntryItem.value.trim().toLowerCase()
      if (newEntryName && newEntryValue &&
          !Object.prototype.hasOwnProperty.call(sequenceItem[this.newEntryType], newEntryName)) {
        sequenceItem[this.newEntryType][newEntryName] = newEntryValue
      }
      this.setNewEntryIndex(-1)
      this.emitDocUpdate()
    },

    removeSequenceItemEntry(sequenceIndex: number, type: ArgsCookiesHeadersType, key: any) {
      const sequenceItem = this.localDoc.sequence[sequenceIndex]
      delete sequenceItem[type][key]
      this.emitDocUpdate()
    },

    // Tags filters

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

    selectedDocTagsChanged(tags: string) {
      if (tags == '') {
        this.selectedDocTags = tags
        this.$emit('form-invalid', true)
      } else {
        this.$emit('form-invalid', false)
        this.selectedDocTags = tags
      }
    },
  },
})
</script>

<style scoped
       lang="scss">

.bar {
  margin: 1rem 0 0.5rem;
}

.sequence-entries {
  margin-bottom: 0.75rem;
}

.sequence-entries-relation {
  margin-bottom: 1rem;
}

.sequence-entries-table .select,
.sequence-entries-table select {
  width: 100%;
}

.relation-wrapper {
  margin-bottom: 1rem;
  text-align: center;
}

.relation-wrapper::before {
  background: hsl(0, 0%, 0%);
  border-top: 1px solid hsl(0, 0%, 0%);
  content: '';
  left: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
}

.filter-columns {
  margin-top: 20px;
}

:deep(.tag-input) {
  font-size: 0.58rem;
}

</style>
