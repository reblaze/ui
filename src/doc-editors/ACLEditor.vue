<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="card collapsible-card"
             :class="{ collapsed: isDataCollapsed }">
          <div class="card-content px-0 py-0">
            <div class="media collapsible px-5 py-5 mb-0"
                 @click="isDataCollapsed = !isDataCollapsed">
              <div class="media-content">
                <p v-show="!isDataCollapsed"
                   class="title is-5"></p>
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
                            title="Document id"
                            data-qa="document-id">
                          {{ localDoc.id }}
                        </span>
                    </label>
                    <div class="control">
                      <input class="input is-small document-name"
                             title="Document name"
                             placeholder="Document name"
                             @change="emitDocUpdate"
                             data-qa="acl-document-name"
                             v-model="localDoc.name"/>
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
                                  rows="2">
                        </textarea>
                    </div>
                  </div>
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
                    <label class="label is-small">Tags</label>
                    <div class="control"
                         data-qa="tag-input">
                      <tag-autocomplete-input :initial-tag="selectedDocTags"
                                              v-model="selectedDocTags"
                                              selection-type="multiple"
                                              @tag-changed="selectedDocTags = $event"/>
                    </div>
                    <labeled-tags title="Automatic Tags"
                                  :tags="automaticTags"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <hr/>
      <div class="columns operation-tags">
        <div class="column is-2"
             v-for="operation in operations"
             :key="operation">
          <p class="title is-7 is-uppercase"
             :data-qa="titles[operation]">{{ titles[operation] }}</p>
          <hr class="bar"
              :class="`bar-${operationClassName(operation)}`"/>
          <table class="table is-narrow is-fullwidth">
            <tbody>
            <tr v-for="(tag, idx) in localDoc[operation]"
                :key="idx">
              <td class="tag-cell ellipsis"
                  :class=" { 'has-text-danger': duplicateTags[tag], 'tag-crossed': allPrior(operation) }"
                  :title="tagMessage(tag, operation) || tag">
                {{ tag }}
              </td>
              <td class="is-size-7 width-20px">
                <a title="remove entry"
                   tabindex="0"
                   data-qa="acl-btn-remove-tag"
                   class="is-small has-text-grey remove-entry-button"
                   @click="removeTag(operation, idx)"
                   @keypress.space.prevent
                   @keypress.space="removeTag(operation, idx)"
                   @keypress.enter="removeTag(operation, idx)">
                  &ndash;
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <tag-autocomplete-input v-if="addNewColName === operation"
                                        ref="tagAutocompleteInput"
                                        :clear-input-after-selection="true"
                                        :selection-type="'single'"
                                        :auto-focus="true"
                                        @keydown.esc="cancelAddNewTag"
                                        @tag-submitted="addNewEntry(operation, $event)"/>
              </td>
              <td class="is-size-7 width-20px">
                <a title="add new entry"
                   data-qa="acl-btn-new-tag"
                   tabindex="0"
                   class="is-size-7 width-20px is-small has-text-grey add-new-entry-button"
                   @click="openTagInput(operation)"
                   @keypress.space.prevent
                   @keypress.space="openTagInput(operation)"
                   @keypress.enter="openTagInput(operation)">
                  +
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {defineComponent} from 'vue'
import {ACLProfile, ACLProfileFilter, CustomResponse, Dictionary} from '@/types'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosResponse} from 'axios'
import LabeledTags from '@/components/LabeledTags.vue'

export default defineComponent({
  name: 'ACLEditor',

  components: {
    LabeledTags,
    TagAutocompleteInput,
  },

  props: {
    selectedBranch: String,
    selectedDoc: Object,
    apiPath: String,
  },
  emits: ['update:selectedDoc', 'form-invalid'],
  data() {
    return {
      operations: ['force_deny', 'passthrough', 'allow_bot', 'deny_bot', 'allow', 'deny'] as ACLProfileFilter[],
      titles: DatasetsUtils.titles,
      addNewColName: null,
      customResponseNames: [] as [CustomResponse['id'], CustomResponse['name']][],

      // collapsed
      isDataCollapsed: false,
    }
  },
  computed: {
    localDoc(): ACLProfile {
      return _.cloneDeep(this.selectedDoc as ACLProfile)
    },

    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['force_deny'], doc['passthrough'],
          doc['allow_bot'], doc['deny_bot'], doc['allow'], doc['deny'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      const result = _.fromPairs(_.zip(dupTags, dupTags))
      this.$emit('form-invalid', !!_.size(result))
      return result
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
        if (tags.trim() == '') {
          this.$emit('form-invalid', true)
        } else {
          this.$emit('form-invalid', false)
        }
        this.emitDocUpdate()
      },
    },

    automaticTags(): string[] {
      const idTag = `aclid:${this.localDoc.id?.replace(/ /g, '-') || ''}`
      const nameTag = `aclname:${this.localDoc.name?.replace(/ /g, '-') || ''}`
      return [idTag, nameTag]
    },
  },
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    // returns true if tag "all" is set in a higher priority section
    allPrior(self: ACLProfileFilter): boolean {
      // top priority, skip
      if (self === 'force_deny') {
        return false
      }

      const selfIdx = _.indexOf(this.operations, self)
      const doc = this.localDoc
      const operations = this.operations

      for (let idx = 0; idx < selfIdx; idx++) {
        if (_.indexOf(doc[operations[idx]], 'all') > -1) {
          if (idx === 3) {
            return false
          }
          if (idx === 2) {
            return selfIdx === 3
          }
          return true
        }
      }
    },

    addNewEntry(section: ACLProfileFilter, entry: string) {
      this.localDoc[section].push(entry)
      this.emitDocUpdate()
    },

    openTagInput(section: ACLProfileFilter) {
      this.addNewColName = section
    },

    cancelAddNewTag() {
      this.addNewColName = null
    },

    removeTag(section: ACLProfileFilter, index: number) {
      this.localDoc[section].splice(index, 1)
      this.addNewColName = null
      this.emitDocUpdate()
    },

    operationClassName(operation: ACLProfileFilter) {
      return operation && operation.replace('_', '-')
    },

    tagMessage(tag: string, operation: ACLProfileFilter) {
      let message = ''
      if (this.allPrior(operation)) {
        message = '[all] is set in a higher priority section'
      } else if (this.duplicateTags[tag]) {
        message = `[${tag}] is duplicated`
      }
      return message
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

@import 'node_modules/bulma/sass/utilities/initial-variables.sass';
@import 'node_modules/bulma/sass/utilities/functions.sass';
@import 'node_modules/bulma/sass/utilities/derived-variables.sass';
@import 'node_modules/bulma/sass/helpers/color.sass';

.bar {
  margin: 1rem 0 0.5rem;
}

.bar-force-deny {
  @extend .has-background-danger;
}

.bar-deny-bot {
  @extend .has-background-danger;
}

.bar-deny {
  @extend .has-background-danger;
}

.bar-passthrough {
  @extend .has-background-success;
}

.bar-allow {
  @extend .has-background-info;
}

.bar-allow-bot {
  @extend .has-background-info;
}

.tag-crossed {
  @extend .has-text-grey-lighter;
  text-decoration: line-through;
}

:deep(.tag-input) {
  font-size: 0.58rem;
}

</style>
