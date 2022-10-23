<template>
  <div v-if="localRule">
    <div v-if="isRecursive">
      <span class="is-small pointer rule-relation-toggle"
            @click="toggleRuleRelation()">
        {{ localRule.relation }}
      </span>
      <div class="tile is-ancestor">
        <div class="tile is-vertical">
          <div class="tile">
            <div class="tile is-parent is-vertical">
              <div class="tile is-child box is-primary section"
                   v-for="(entry, entryIndex) in localRule.entries"
                   :key="entryIndex">
                <entries-relation-list v-model:rule="localRule.entries[entryIndex]"
                                       @update:rule="ruleUpdated($event, entryIndex)"
                                       :editable="editable"
                                       :deletable="true"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <table class="table is-narrow entries-table mb-0">
        <tbody>
        <tr v-for="(entry, entryIndex) in localRule.entries"
            :key="entryIndex"
            :name="entryIndex"
            class="entry-row">
          <td class="is-size-7 width-50px has-text-centered has-text-weight-medium">
            <span
                v-if="entryIndex === 0"
                class="is-small pointer rule-relation-toggle"
                @click="toggleRuleRelation()">
              {{ localRule.relation }}
            </span>
          </td>
          <td class="is-size-7 entry-category has-text-weight-medium width-100px">
            {{ listEntryTypes[entry[0]].title }}
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

        <tr v-if="!newEntryOpen && editable">
          <td colspan="2">
            <a class="is-size-7 has-text-grey-lighter add-button add-entry-button"
               title="add new row"
               tabindex="0"
               @click="openNewEntry()"
               @keypress.space.prevent
               @keypress.space="openNewEntry()"
               @keypress.enter="openNewEntry()">
              <i class="fas fa-plus"></i>
            </a>
            &nbsp;&middot;&nbsp;
            <a class="is-size-7 has-text-grey-lighter remove-button remove-section-button"
               title="remove entire section"
               tabindex="0"
               @click="removeEntries()"
               @keypress.space.prevent
               @keypress.space="removeEntries()"
               @keypress.enter="removeEntries()">
              <i class="fas fa-trash"></i>
            </a>
          </td>
        </tr>

        <tr v-if="newEntryOpen && editable"
            class="new-entry-row">
          <td class="is-size-7"
              colspan="2">
            <div class="select is-small is-fullwidth">
              <select v-model="newEntryCategory"
                      @change="clearFields"
                      title="New entry category"
                      class="select new-entry-type-selection">
                <option v-for="(entryType, category) in listEntryTypes"
                        :key="category"
                        :value="category">
                  {{ entryType.title }}
                </option>
              </select>
            </div>
          </td>
          <td class="is-size-7 width-250px">
            <div v-if="isCategoryArgsCookiesHeaders(newEntryCategory)"
                 class="control has-icons-left is-fullwidth new-entry-name">
              <input class="input is-small new-entry-name-input"
                     title="Name"
                     placeholder="Name"
                     v-model="newEntryItem.firstAttr"/>
              <span class="icon is-small is-left has-text-grey-light"><i class="fa fa-font"></i></span>
            </div>
            <textarea v-else
                      title="Entries"
                      v-model="newEntryItem.firstAttr"
                      placeholder="One entry per line, use '#' for annotation"
                      class="textarea is-small is-fullwidth new-entry-textarea"
                      rows="3"/>
          </td>
          <td class="is-size-7 width-250px">
            <div class="control has-icons-left is-fullwidth new-entry-value-annotation">
              <input class="input is-small new-entry-value-annotation-input"
                     :placeholder="isCategoryArgsCookiesHeaders( newEntryCategory ) ? 'Value' : 'Annotation'"
                     v-model="newEntryItem.secondAttr"/>
              <span v-show="isCategoryArgsCookiesHeaders( newEntryCategory )"
                    class="icon is-small is-left has-text-grey-light">
                <i class="fa fa-code"></i>
              </span>
              <span v-show="!isCategoryArgsCookiesHeaders( newEntryCategory )"
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
               @click="newEntryOpen = false"
               @keypress.space.prevent
               @keypress.space="newEntryOpen = false"
               @keypress.enter="newEntryOpen = false">
              <i class="fas fa-times"></i> Cancel
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="editable"
         class="field is-grouped is-pulled-left mt-5">
      <div class="control">
        <button class="button is-small add-section-button"
                title="Add new section"
                @click="addSection">
          <span class="icon is-small">
            <i class="fas fa-plus"></i>
          </span>
          <span>
            Create new section
          </span>
        </button>
      </div>

      <div class="control"
           v-if="deletable">
        <button class="button is-small has-text-danger delete-section-button"
                title="Delete section"
                @click="deleteSection">
          <span class="icon is-small">
            <i class="fas fa-trash"></i>
          </span>
          <span>
            Delete section
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Category, GlobalFilterRule, GlobalFilterRuleEntry, GlobalFilterRuleSection, Relation} from '@/types'
import _ from 'lodash'

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
        'path': {'title': 'Path', 'pair': false},
        'query': {'title': 'Query', 'pair': false},
        'uri': {'title': 'URI', 'pair': false},
        'method': {'title': 'Method', 'pair': false},
        'ip': {'title': 'IP Address', 'pair': false},
        'asn': {'title': 'ASN', 'pair': false},
        'country': {'title': 'Country', 'pair': false},
        'headers': {'title': 'Header', 'pair': true},
        'args': {'title': 'Argument', 'pair': true},
        'cookies': {'title': 'Cookie', 'pair': true},
      },
      newSectionOpen: false,
      newEntryOpen: false,
      // newEntryCategory - start with most common category - IP
      newEntryCategory: 'ip' as Category,
      newEntryItem: {
        firstAttr: '',
        secondAttr: '',
      },
    }
  },
  computed: {
    localRule(): GlobalFilterRuleSection {
      return _.cloneDeep(this.rule) as GlobalFilterRuleSection
    },

    isRecursive() {
      const entries = this.localRule?.entries
      return entries?.length && !_.isArray((entries)[0])
    },
  },
  watch: {},
  methods: {
    ruleUpdated(val: any, index: number) {
      this.localRule.entries[index] = val
      this.emitRuleUpdate()
    },

    emitRuleUpdate() {
      this.$emit('update:rule', this.localRule)
    },

    toggleRuleRelation() {
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
        this.localRule.entries = [currentSection]
      }
      this.localRule.entries.push(newSection)
      this.emitRuleUpdate()
    },

    deleteSection() {
      delete this.localRule
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

    removeEntry(entryIndex: number) {
      this.localRule.entries.splice(entryIndex, 1)
      // TODO
      // if (!section.entries.length) {
      //   this.removeSection(sectionIndex)
      // }
      this.emitRuleUpdate()
    },

    addEntry() {
      if (!this.newEntryItem.firstAttr.trim()) {
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
          this.localRule.entries.push([this.newEntryCategory, entry, annotation])
        })
      }
      this.newEntryOpen = false
      this.emitRuleUpdate()
    },

    removeEntries() {
      this.localRule.entries = []
      this.emitRuleUpdate()
    },

    openNewEntry() {
      this.clearCategory()
      this.clearFields()
      this.newEntryOpen = true
    },

    clearCategory() {
      this.newEntryCategory = 'ip' as Category
    },

    clearFields() {
      this.newEntryItem = {
        firstAttr: '',
        secondAttr: '',
      }
    },
  },
})
</script>
<style scoped
       lang="scss">
// TODO: Fix styling
.is-ancestor {
  margin-left: 50px;
}

.pointer {
  cursor: pointer;
}

.section {
  padding: initial;
}

.relation-selection-wrapper {
  margin-top: -1.5rem;
}

.entries-wrapper {
  max-height: 1000px;
  overflow-y: auto;
}

.section-relation-toggle {
  cursor: pointer;
}
</style>

