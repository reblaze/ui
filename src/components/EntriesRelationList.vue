<template>
  <div v-if="localRule"
       class="card collapsible-card entries-relation-wrapper"
       :class="{ collapsed: isCollapsed }">
    <div class="card-content px-0 py-0">
      <div class="media collapsible columns is-gapless px-5 py-5 mb-0"
           @click="isCollapsed = !isCollapsed">
        <div class="column is-narrow title-wrapper">
          <span v-show="isCollapsed">
            <i class="fas fa-angle-down"
               aria-hidden="true"></i>
          </span>
          <span v-show="!isCollapsed">
            <i class="fas fa-angle-up"
               aria-hidden="true"></i>
          </span>
          <div class="media-content mx-3 is-inline-block">
            <p class="title is-6 card-title">
              {{ cardTitle }}
            </p>
          </div>
        </div>
        <div class="column buttons-wrapper height-30px">
          <div class="field is-grouped is-pulled-left">
            <div v-if="editable"
                 class="control">
              <button class="button is-small add-section-button"
                      title="Add new section"
                      @click.stop="addSection()"
                      @keypress.space.prevent
                      @keypress.space.stop="addSection()"
                      @keypress.enter.stop="addSection()">
                <span class="icon is-small">
                  <i class="fas fa-plus"></i>
                </span>
                <span>
                  New Section
                </span>
              </button>
            </div>
            <div v-if="editable"
                 class="control">
              <button class="button is-small add-entry-button"
                      title="Add new entry"
                      :disabled="newEntryOpen || isRecursive"
                      @click.stop="setNewEntryOpen(true)"
                      @keypress.space.prevent
                      @keypress.space.stop="setNewEntryOpen(true)"
                      @keypress.enter.stop="setNewEntryOpen(true)">
                <span class="icon is-small">
                  <i class="fas fa-plus"></i>
                </span>
                <span>
                  New Entry
                </span>
              </button>
            </div>
            <div class="control">
              <button class="button is-small rule-relation-toggle"
                      title="Toggle rule relation"
                      :disabled="ruleContainsSameCategoryItems || !editable"
                      @click.stop="toggleRuleRelation()"
                      @keypress.space.prevent
                      @keypress.space.stop="toggleRuleRelation()"
                      @keypress.enter.stop="toggleRuleRelation()">
                  <span>
                    Relation:
                  <span class="has-text-weight-bold">
                    {{ localRule.relation }}
                  </span>
                </span>
              </button>
            </div>
          </div>
          <div v-if="editable"
               class="field is-grouped is-pulled-right">
            <div class="dropdown control is-right"
                 :class="{'is-active': removeMenuVisible}">
              <div class="dropdown-trigger">
                <button class="button is-size-7 remove-menu-toggle-button is-block"
                        aria-haspopup="true"
                        aria-controls="dropdown-menu"
                        :title="`${removeMenuVisible ? 'Close' : 'Open'} menu`"
                        @click.stop="removeMenuVisible = !removeMenuVisible"
                        @keypress.space.prevent
                        @keypress.space.stop="removeMenuVisible = !removeMenuVisible"
                        @keypress.enter.stop="removeMenuVisible = !removeMenuVisible"
                        @blur="closeRemoveMenu($event)">
                  <span class="icon is-small">
                    <i class="fas fa-ellipsis-v"></i>
                  </span>
                </button>
              </div>
              <div class="dropdown-menu"
                   id="dropdown-menu"
                   role="menubar">
                <div class="dropdown-content width-220px py-0">
                  <button class="button is-small has-text-danger remove-all-entries-button dropdown-item"
                          title="Remove all entries"
                          :disabled="isEntriesEmpty"
                          @click="removeAllEntries()"
                          @keypress.space.prevent
                          @keypress.space="removeAllEntries()"
                          @keypress.enter="removeAllEntries()"
                          @blur="closeRemoveMenu($event)">
                    <span class="icon is-small">
                      <i class="fas fa-trash"></i>
                    </span>
                    <span>
                      Clear Section Content
                    </span>
                  </button>
                  <template v-if="deletable">
                    <hr class="dropdown-divider my-0">
                    <button class="button is-small has-text-danger remove-section-button dropdown-item"
                            title="Remove section"
                            @click="emitRemoveSection()"
                            @keypress.space.prevent
                            @keypress.space="emitRemoveSection()"
                            @keypress.enter="emitRemoveSection()"
                            @blur="closeRemoveMenu($event)">
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                      <span>
                        Completely Remove Section
                      </span>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content collapsible-content px-5 pb-5"
           v-if="!isEntriesEmpty || newEntryOpen">
        <div class="data-wrapper">
          <template v-if="isRecursive">
            <div class="sections-wrapper"
                 v-for="(entry, entryIndex) in localRule.entries"
                 :key="entryIndex">
              <entries-relation-list v-model:rule="localRule.entries[entryIndex]"
                                     @update:rule="ruleUpdated($event, entryIndex)"
                                     @invalid="emitValidity($event)"
                                     @remove-section="removeSection(entryIndex)"
                                     :editable="editable"
                                     :deletable="true"/>
            </div>
          </template>
          <template v-else>
            <div class="entries-wrapper">
              <table class="table is-narrow entries-table mb-0">
                <tbody>
                <tr v-for="(entry, entryIndex) in localRule.entries"
                    :key="entryIndex"
                    :name="entryIndex"
                    class="entry-row"
                    :class="{'has-text-danger': isEntryDuplicate(entry[0], entry[1])}">
                  <td class="is-size-7 entry-category has-text-weight-medium width-150px">
                    {{ listEntryTypes[entry[0]] }}
                  </td>
                  <td :title="dualCell(entry[1])"
                      class="is-size-7 entry-value width-250px ellipsis">
                    <span v-html="dualCell(entry[1])"></span>
                  </td>
                  <td :title="entry[2]"
                      class="is-size-7 entry-annotation width-250px ellipsis">
                    {{ entry[2] ? entry[2].substr(0, 60) : '' }}
                  </td>
                  <td class="is-size-7 width-80px">
                    <a v-if="editable"
                       tabindex="0"
                       class="is-small has-text-grey remove-entry-button"
                       title="remove entry"
                       @click="removeEntry(entryIndex)"
                       @keypress.space.prevent
                       @keypress.space="removeEntry(entryIndex)"
                       @keypress.enter="removeEntry(entryIndex)">
                      remove
                    </a>
                  </td>
                </tr>

                <tr v-if="newEntryOpen && editable"
                    class="new-entry-row">
                  <td class="is-size-7 width-150px">
                    <div class="select is-small is-fullwidth">
                      <select v-model="newEntryCategory"
                              @change="clearFields"
                              title="New entry category"
                              class="select new-entry-type-selection">
                        <option v-for="(title, category) in listEntryTypes"
                                :key="category"
                                :value="category">
                          {{ title }}
                        </option>
                      </select>
                    </div>
                  </td>
                  <td class="is-size-7 width-250px">
                    <div v-if="isCategoryArgsCookiesHeaders(newEntryCategory)"
                         class="control has-icons-left is-fullwidth new-entry-name">
                      <input class="input is-small new-entry-name-input"
                             :class="{
                                'is-danger': isErrorField(newEntryCategory) || isErrorField('firstAttrEmpty'),
                              }"
                             @input="validateFirstAttrEmpty()"
                             title="Name"
                             placeholder="Name"
                             v-model="newEntryItem.firstAttr"/>
                      <span class="icon is-small is-left has-text-grey-light"><i class="fa fa-font"></i></span>
                    </div>
                    <textarea v-else
                              title="Entries"
                              v-model="newEntryItem.firstAttr"
                              @input="validateValue(newEntryItem.firstAttr)"
                              placeholder="One entry per line, use '#' for annotation"
                              class="textarea is-small is-fullwidth new-entry-textarea"
                              :class="{
                                'is-danger': isErrorField(newEntryCategory) || isErrorField('firstAttrEmpty'),
                              }"
                              rows="3"/>
                    <div class="invalid-ips-errors help is-danger"
                         v-if="invalidIPs.length">
                      <div class="mr-2">Please check the following:</div>
                      <div v-for="(err,errIndex) in invalidIPs"
                           :key="errIndex">
                        {{ err }}
                      </div>
                    </div>
                  </td>
                  <td class="is-size-7 width-250px">
                    <div class="control has-icons-left is-fullwidth new-entry-value-annotation">
                      <input class="input is-small new-entry-value-annotation-input"
                             :class="{ 'is-danger': isErrorField('secondAttrEmpty') }"
                             :placeholder="isCategoryArgsCookiesHeaders(newEntryCategory) ? 'Value' : 'Annotation'"
                             @input="validateSecondAttrEmpty()"
                             v-model="newEntryItem.secondAttr"/>
                      <span v-show="isCategoryArgsCookiesHeaders(newEntryCategory)"
                            class="icon is-small is-left has-text-grey-light">
                <i class="fa fa-code"></i>
              </span>
                      <span v-show="!isCategoryArgsCookiesHeaders(newEntryCategory)"
                            class="icon is-small is-left has-text-grey-light">
                <i class="fa fa-font"></i>
              </span>
                    </div>
                  </td>
                  <td class="is-size-7 width-80px">
                    <a class="is-size-7 has-text-grey add-button confirm-add-entry-button"
                       title="add new row"
                       tabindex="0"
                       @click="addEntry()"
                       @keypress.space.prevent
                       @keypress.space="addEntry()"
                       @keypress.enter="addEntry()">
                      <i class="fas fa-check"></i> Add
                    </a>
                    <br/>
                    <a class="is-size-7 has-text-grey remove-button cancel-entry-button"
                       title="cancel add new row"
                       tabindex="0"
                       @click="setNewEntryOpen(false)"
                       @keypress.space.prevent
                       @keypress.space="setNewEntryOpen(false)"
                       @keypress.enter="setNewEntryOpen(false)">
                      <i class="fas fa-times"></i> Cancel
                    </a>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Category, GlobalFilterRule, GlobalFilterRuleEntry, GlobalFilterRuleSection, Relation} from '@/types'
import _ from 'lodash'
import Utils from '@/assets/Utils'

export default defineComponent({
  name: 'EntriesRelationList',
  props: {
    rule: {
      type: Object as PropType<GlobalFilterRuleSection>,
      default: () => {
        return {
          relation: 'OR',
          entries: [],
        }
      },
      validator: (value) => {
        // TODO: Fix recursive validator
        const typedValue = value as GlobalFilterRuleSection
        return !(!typedValue || !typedValue.relation || !typedValue.entries)
        // const isRelationValid = ['OR', 'AND'].includes(value.relation.toUpperCase())
        // const isListInvalid = value.entries.find((section: GlobalFilterRuleSection) => {
        //   const isSectionRelationInvalid = !(['OR', 'AND'].includes(value.relation.toUpperCase()))
        //   const isSectionsEntriesInvalid = !section.entries || !section.entries.find ||
        //       section.entries.find((entry: GlobalFilterRuleEntry) => {
        //         return (!entry || !entry.length || entry.length < 2 || entry.length > 3)
        //       })
        //   return isSectionRelationInvalid || isSectionsEntriesInvalid
        // })
        // return isRelationValid && !isListInvalid
      },
    },
    editable: Boolean,
    deletable: Boolean,
  },
  data() {
    return {
      listEntryTypes: {
        args: 'Argument',
        authority: 'Authority',
        company: 'Company',
        cookies: 'Cookie',
        country: 'Country',
        headers: 'Header',
        ip: 'IP Address',
        method: 'Method',
        network: 'Network',
        path: 'Path',
        securitypolicyentryid: 'Path Matching ID',
        asn: 'Provider',
        query: 'Query',
        region: 'Region',
        securitypolicyid: 'Security Policy ID',
        session: 'Session ID',
        subregion: 'Subregion',
        uri: 'URI',
      },
      isCollapsed: false,
      newEntryOpen: false,
      // newEntryCategory - start with most common category - IP
      newEntryCategory: 'ip' as Category,
      newEntryItem: {
        firstAttr: '',
        secondAttr: '',
      },
      removeMenuVisible: false,
      duplicatedEntries: [],
      invalidIPs: [],
      entriesErrors: [],
    }
  },
  emits: ['update:rule', 'invalid', 'remove-section'],
  watch: {
    entriesErrors: {
      handler(val) {
        this.emitValidity(!!val.length)
      },
      deep: true,
    },
  },
  computed: {
    localRule(): GlobalFilterRuleSection {
      return _.cloneDeep(this.rule) as GlobalFilterRuleSection
    },

    isEntriesEmpty() {
      return !this.localRule?.entries?.length
    },

    isRecursive() {
      const entries = this.localRule?.entries
      return !this.isEntriesEmpty && !_.isArray((entries)[0])
    },

    cardTitle() {
      const length = this.localRule.entries.length
      let title = `${length} `
      if (!length) {
        title += 'Sections or Entries'
      } else if (length === 1) {
        title += this.isRecursive ? 'Section' : 'Entry'
      } else {
        title += this.isRecursive ? 'Sections' : 'Entries'
      }
      return title
    },

    ruleContainsSameCategoryItems() {
      const countedCategories = _.countBy(this.localRule.entries as GlobalFilterRuleEntry[], (entry) => {
        return entry[0]
      })
      const categories = Object.keys(this.listEntryTypes)
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i]
        if (this.isCategoryArgsCookiesHeaders(category as Category)) {
          continue
        }
        if (countedCategories[category] > 1) {
          return true
        }
      }
      return false
    },

    newEntryItemCounter() {
      const counter = {
        entries: 0,
        annotations: 0,
      }
      _.forEach(this.newEntryItem.firstAttr.split('\n'), (line) => {
        const [entry, annotation] = line.trim().split('#')
        if (entry?.trim()) {
          counter.entries++
        }
        if (annotation?.trim()) {
          counter.annotations++
        }
      })
      return counter
    },
  },
  methods: {
    ruleUpdated(val: any, index: number) {
      this.localRule.entries[index] = val
      this.emitRuleUpdate()
    },

    emitRuleUpdate() {
      this.$emit('update:rule', this.localRule)
    },

    emitValidity(invalid?: boolean) {
      this.$emit('invalid', invalid || !!this.entriesErrors.length || this.newEntryOpen)
    },

    closeRemoveMenu(event?: FocusEvent) {
      if (!event || !(event.relatedTarget as HTMLElement)?.classList.contains('dropdown-item')) {
        this.removeMenuVisible = false
      }
    },

    emitRemoveSection() {
      this.closeRemoveMenu()
      this.setNewEntryOpen(false)
      this.$emit('remove-section', this.localRule)
    },

    toggleRuleRelation() {
      if (this.ruleContainsSameCategoryItems) {
        return
      }
      this.localRule.relation = (this.localRule.relation === 'AND') ? 'OR' : 'AND'
      this.emitRuleUpdate()
    },

    addSection() {
      const newSection = {
        relation: 'OR' as Relation,
        entries: [] as GlobalFilterRule[],
      }
      if (!this.isRecursive && this.localRule.entries.length) {
        const currentSection = {
          relation: this.localRule.relation as Relation,
          entries: this.localRule.entries as GlobalFilterRule[],
        }
        this.localRule.relation = 'OR'
        this.localRule.entries = [currentSection]
      }
      this.localRule.entries.push(newSection)
      this.setNewEntryOpen(false)
      this.emitRuleUpdate()
    },

    isCategoryArgsCookiesHeaders(category: Category) {
      return (new RegExp('(args|cookies|headers)')).test(category)
    },

    dualCell(cell: GlobalFilterRuleEntry[1]) {
      if (_.isArray(cell)) {
        return `${cell[0]}: ${cell[1]}`
      } else {
        return cell
      }
    },

    addEntry() {
      this.validateFirstAttrEmpty()
      this.validateSecondAttrEmpty()
      if (this.isErrorField(this.newEntryCategory) ||
          this.isErrorField('firstAttrEmpty') ||
          this.isErrorField('secondAttrEmpty')) {
        return
      }
      // args cookies or headers
      if (this.isCategoryArgsCookiesHeaders(this.newEntryCategory)) {
        const newEntryName = this.newEntryItem.firstAttr.trim().toLowerCase()
        const newEntryValue = this.newEntryItem.secondAttr.trim().toLowerCase()
        if (newEntryName && newEntryValue) {
          this.localRule.entries.push([this.newEntryCategory, [newEntryName, newEntryValue], ''])
        }
      } else { // every other entry type
        const generalAnnotation = this.newEntryItem.secondAttr.trim()
        _.each(this.newEntryItem.firstAttr.split('\n'), (line) => {
          let [entry, annotation] = line.trim().split('#')
          entry = entry.trim()
          annotation = annotation ? annotation.trim() : generalAnnotation
          if (entry) {
            this.localRule.entries.push([this.newEntryCategory, entry, annotation])
          }
        })
      }
      // change relation to 'OR' if needed
      if (this.ruleContainsSameCategoryItems) {
        this.localRule.relation = 'OR'
      }
      this.setNewEntryOpen(false)
      this.emitRuleUpdate()
      this.$nextTick(this.validateDuplicates)
    },

    removeEntry(entryIndex: number) {
      this.localRule.entries.splice(entryIndex, 1)
      this.emitRuleUpdate()
      this.$nextTick(this.validateDuplicates)
    },

    removeAllEntries() {
      this.localRule.entries = []
      this.closeRemoveMenu()
      this.setNewEntryOpen(false)
      this.emitRuleUpdate()
    },

    removeSection(sectionIndex: number) {
      this.localRule.entries.splice(sectionIndex, 1)
      this.setNewEntryOpen(false)
      this.emitRuleUpdate()
    },

    setNewEntryOpen(value: boolean) {
      this.clearCategory()
      this.clearFields()
      if (!value) {
        this.invalidIPs = []
        this.clearError(`${this.newEntryCategory}`)
      }
      this.newEntryOpen = value
    },

    clearCategory() {
      this.newEntryCategory = 'ip' as Category
    },

    clearFields() {
      this.newEntryItem = {
        firstAttr: '',
        secondAttr: '',
      }
      this.clearError()
      this.invalidIPs = []
    },

    clearError(field: string = '') {
      this.entriesErrors = field ? this.entriesErrors.filter((err: string) => err !== field) : []
    },

    isErrorField(field: string) {
      return this.entriesErrors.includes(field)
    },

    addError(field: string) {
      if (!this.isErrorField(field)) {
        this.entriesErrors.push(field)
      }
    },

    validateFirstAttrEmpty() {
      if (this.isRecursive || !this.newEntryOpen) {
        return
      }
      const id = 'firstAttrEmpty'
      this.clearError(id)
      const firstAttrValue = this.newEntryItem.firstAttr.trim()
      if (!firstAttrValue && this.newEntryItemCounter.entries < this.newEntryItemCounter.annotations) {
        this.addError(id)
      }
    },

    validateSecondAttrEmpty() {
      if (this.isRecursive || !this.newEntryOpen) {
        return
      }
      const id = 'secondAttrEmpty'
      this.clearError(id)
      const secondAttrValue = this.newEntryItem.secondAttr.trim()
      if (!secondAttrValue && this.newEntryItemCounter.entries > this.newEntryItemCounter.annotations) {
        this.addError(id)
      }
    },

    validateDuplicates() {
      if (this.isRecursive) {
        return
      }
      this.duplicatedEntries = []
      const groupedEntries = _.groupBy((this.localRule.entries as GlobalFilterRuleEntry[]), (entry) => {
        return entry[0]
      })
      _.forEach(groupedEntries, (ruleEntries: GlobalFilterRuleEntry[], key: string) => {
        const values = _.map(ruleEntries, (ruleEntry: GlobalFilterRuleEntry) => {
          return ruleEntry[1]
        })
        _.filter(values, (value, index, iteratee) => {
          if (_.includes(iteratee, value, index + 1) &&
              !this.isEntryDuplicate(key as Category, value)) {
            this.duplicatedEntries.push([key, value])
          }
        })
      })
      if (this.duplicatedEntries.length) {
        const duplicatesMsg = this.duplicatedEntries.reduce(
            (prev: string, [category, value]: GlobalFilterRuleEntry) => {
              return `${prev}<br/>` +
                  `${this.listEntryTypes[category as Category]} = ${this.dualCell(value)}`
            },
            '',
        )
        this.addError('duplicate')
        Utils.toast(`There are duplicate entries in the list:${duplicatesMsg}`, 'is-danger')
      } else {
        this.clearError('duplicate')
      }
    },

    isEntryDuplicate(currentCategory: GlobalFilterRuleEntry[0], currentValue: GlobalFilterRuleEntry[1]) {
      const index = this.duplicatedEntries.findIndex(
          ([category, value]) => {
            return category === currentCategory && _.isEqual(value, currentValue)
          },
      )
      return index > -1
    },

    validateValue(value: string) {
      this.validateFirstAttrEmpty()
      if (this.newEntryCategory === 'ip') {
        this.validateIp(this.newEntryCategory, value)
      }
    },

    validateIp(id: string, value: string) {
      // eslint-disable-next-line max-len
      const ipPattern = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*(:([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9]|\/[1-2][0-9]|\/[1-3][0-2]))?(\s?(#([a-zA-Z0-9$@!%*?&#^-_. +:"'/\\;,-=]+)?)?)?$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(:([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9]|\/[1-2][0-9]|\/[1-3][0-2]))?(\s?(#([a-zA-Z0-9$@!%*?&#^-_. +:"'/\\;,-=]+)?)?)?$))/
      const ipList = value.split('\n').filter((ip) => ip)
      this.invalidIPs = []
      ipList.forEach((line, index) => {
        if (!this.validate(line, ipPattern, id)) {
          this.invalidIPs.push(ipList.length > 1 ? `(line ${index + 1}) ${line}` : line)
        }
      })
      if (this.invalidIPs.length) {
        this.addError(id)
      }
    },

    validate(value: string, pattern: RegExp, name: string) {
      const isValid = pattern ? (new RegExp(pattern)).test(value) : value.length
      if (!isValid && !this.isErrorField(name)) {
        this.addError(name)
      } else if (isValid) {
        this.clearError(name)
      }
      return isValid
    },
  },
})
</script>
<style scoped
       lang="scss">
@import 'src/assets/styles/colors';

.entries-relation-wrapper:hover {
  background-color: $color-black-haze;
}

.entries-table {
  background-color: transparent;
}

.entries-relation-wrapper .media {
  box-sizing: content-box;
  height: 30px;
}

.card-title {
  line-height: 30px;
}

.entries-wrapper {
  max-height: 1000px;
  overflow-y: auto;
  width: 100%;
}

.dropdown-item {
  background: transparent;
  border-color: transparent;
  color: initial;
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

</style>

