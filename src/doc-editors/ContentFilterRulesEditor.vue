<template>
  <div>
    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div class="columns columns-divided mb-0">
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id" title="Document id">
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
                                            @tag-changed="selectedDocTags = $event">
                    </tag-autocomplete-input>
                  </div>
                </div>
                <automatic-tags
                  :tags = "localAutomaticTags" >
                </automatic-tags>
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
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ContentFilterRule, LocalAutomaticTags} from '@/types'
import _ from 'lodash'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import AutomaticTags from '@/components/AutomaticTags.vue'


export default defineComponent({
  name: 'ContentFilterRulesEditor',

  components: {
    AutomaticTags,
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
    localAutomaticTags(): LocalAutomaticTags {
      return {
        tagID: `cf-rule-id:${this.localDoc.id?.replace(/ /g, '-') || ''}`,
        tagName: `cf-rule-risk:${this.localDoc.risk}`,
        tagCategory: `cf-rule-category:${this.localDoc.category?.replace(/ /g, '-') || ''}`,
        tagSubCategory: `cf-rule-subcategory:${this.localDoc.subcategory?.replace(/ /g, '-') || ''}`,
      }
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

    createTagElement(tag: string): string {
      return `
            <div
                class="automatic-tag ellipsis"
                title="${tag}">
                    ${tag}
            </div>`
    },
  },
})
</script>

<style lang="scss">

@import 'node_modules/bulma/sass/utilities/initial-variables.sass';
@import 'node_modules/bulma/sass/utilities/functions.sass';
@import 'node_modules/bulma/sass/utilities/derived-variables.sass';
@import 'node_modules/bulma/sass/helpers/color.sass';

.automatic-tag {
  @extend .has-background-grey-lighter;
  border: 1px solid #fff;
  border-radius: 10px;
  margin-right: 0.25rem;
  max-width: 90vh;
  padding: 0.05rem 0.5rem;
  width: fit-content;
}

</style>
