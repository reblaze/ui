<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="columns columns-divided mb-0">
          <div class="column is-4">
            <div class="field">
              <label class="label is-small">
                Name
                <span class="has-text-grey is-pulled-right document-id"
                      title="Document id">
                    {{ selectedDoc.id }}
                  </span>
              </label>
              <div class="control">
                <input class="input is-small document-name"
                       data-qa="document-name-input"
                       title="Document name"
                       placeholder="Document name"
                       v-model="localDoc.name"
                       @change="emitDocUpdate"/>
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
          </div>
          <div class="column is-4">
            <div class="field">
              <label class="label is-small">Category</label>
              <div class="control">
                <input class="input is-small document-category"
                       data-qa="category-input"
                       title="Category"
                       placeholder="Category"
                       v-model="localDoc.category"
                       @change="emitDocUpdate"/>
              </div>
            </div>
            <div class="field">
              <label class="label is-small">Subcategory</label>
              <div class="control">
                <input class="input is-small document-subcategory"
                       data-qa="subcategory-input"
                       title="Subcategory"
                       placeholder="Subcategory"
                       v-model="localDoc.subcategory"
                       @change="emitDocUpdate"/>
              </div>
            </div>
            <div class="field">
              <label class="label is-small">Risk Level</label>
              <div class="control select is-small">
                <select v-model="localDoc.risk"
                        @change="emitDocUpdate"
                        data-qa="risk-level-dropdown"
                        class="risk-level-selection"
                        title="Risk level">
                  <option v-for="(riskLevel, index) in riskLevels"
                          :value="riskLevel"
                          :key="index">
                    {{ riskLevel }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="column is-4">
            <div class="field">
              <label class="label is-small">Tags</label>
              <div class="control"
                   data-qa="tag-input">
                <tag-autocomplete-input :initial-tag="selectedDocTags"
                                        :selection-type="'multiple'"
                                        @tag-changed="selectedDocTags = $event" />
              </div>
              <labeled-tags title="Automatic Tags"
                            :tags="automaticTags" />
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label is-small">Log Message</label>
          <div class="control">
            <input class="input is-small document-msg"
                   data-qa="log-message-input"
                   type="text"
                   title="Message to appear in the logs"
                   placeholder="Log message"
                   v-model="localDoc.msg"
                   @change="emitDocUpdate"
                   required>
          </div>
        </div>
        <div class="field">
          <label class="label is-small">Match</label>
          <div class="control has-icons-left">
            <input class="input is-small document-operand"
                   data-qa="matching-regex-input"
                   type="text"
                   title="Match"
                   placeholder="matching regex"
                   v-model="localDoc.operand"
                   @change="emitDocUpdate"
                   required>
            <span class="icon is-small is-left has-text-grey">
              <i class="fas fa-code"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ContentFilterRule} from '@/types'
import _ from 'lodash'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import LabeledTags from '@/components/LabeledTags.vue'

export default defineComponent({
  name: 'ContentFilterRulesEditor',
  components: {
    LabeledTags,
    TagAutocompleteInput,
  },
  props: {
    selectedDoc: Object,
  },
  computed: {
    localDoc(): ContentFilterRule {
      return _.cloneDeep(this.selectedDoc as ContentFilterRule)
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
      const ruleTag = `cf-rule-id:${this.localDoc.id?.replace(/ /g, '-') || ''}`
      const riskTag = `cf-rule-risk:${this.localDoc.risk}`
      const categoryTag = `cf-rule-category:${this.localDoc.category?.replace(/ /g, '-') || ''}`
      const subcategoryTag = `cf-rule-subcategory:${this.localDoc.subcategory?.replace(/ /g, '-') || ''}`
      return [ruleTag, riskTag, categoryTag, subcategoryTag]
    },
  },
  data() {
    return {
      riskLevels: [1, 2, 3, 4, 5],
    }
  },
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
  },
})
</script>
