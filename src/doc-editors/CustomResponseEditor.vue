<template>
  <div class="card">
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
                       title="Document name"
                       data-qa="custom-response-document-name"
                       placeholder="Document name"
                       @change="emitDocUpdate"
                       v-model="localDoc.name"/>
              </div>
            </div>
            <div class="field">
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
            <div class="field">
              <label class="label is-small">Type</label>
              <div class="select is-small">
                <select v-model="localDoc.type"
                        class="type-selection"
                        title="Switch type"
                        @change="emitDocUpdate()">
                  <option v-for="name in selectedType"
                          :key="name"
                          :value="name">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>
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
          </div>
          <div v-if="localDoc.type === 'custom'" class="column is-9">
            <div class="field">
              <label class="label is-small status-code-label">
                Status code
              </label>
              <div class="columns mb-0 status-code">
                <div class="column is-5 pb-0">
                  <input class="input is-small document-status-code"
                         data-qa="status-input"
                         type="number"
                         title="Status code"
                         placeholder="Status code"
                         @change="emitDocUpdate"
                         v-model.number="localDoc.params.status">
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label is-small is-size-7 has-text-left form-label">
                Headers
              </label>
              <div v-for="(header, index) in headersArray" :key="index"
                   class="columns mb-0 headers-columns">
                <div class="column is-5">
                  <input class="input is-small document-header-key"
                         title="Header key"
                         placeholder="Header key"
                         v-model="header.key"/>
                </div>
                <div class="column is-5">
                  <input class="input is-small document-header-key"
                         title="Header value"
                         placeholder="Header value"
                         v-model="header.value"/>
                </div>
                <div class="column is-narrow">
                  <button class="button is-light is-small remove-icon is-small has-text-grey"
                          title="Click to remove"
                          @click="removeHeaderElement(index)">
                    <span class="icon is-small"><i class="fas fa-trash fa-xs"></i></span>
                  </button>
                </div>
              </div>
              <a title="Add new option rule"
                 class="is-text is-small is-size-7 ml-3 add-key-button"
                 data-qa="add-new-key-btn"
                 tabindex="0"
                 @keypress.space.prevent
                 @click="addHeaderElement()">
                New entry
              </a>
            </div>
            <div class="field">
              <label class="label is-small content">
                Content
              </label>
              <textarea class="is-small textarea document-content"
                        title="Content"
                        v-model="localDoc.params.content"
                        @input="emitDocUpdate()"
                        rows="20">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {CustomResponse} from '@/types'
import {defineComponent} from 'vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'

type HeaderObject = {
  key: string
  value: string
}
export default defineComponent({
  components: {
    TagAutocompleteInput,
  },
  watch: {
    selectedDoc: {
      handler: function(value) {
        // Only resetting header array if different to avoid a recursive loop
        const newHeadersArray = this.getHeadersArray()
        if (!_.isEqual(this.headersArray, newHeadersArray)) {
          this.headersArray = newHeadersArray
        }
        // adding necessary fields to all local doc sections if missing
        if (!value['params']) {
          this.normalizeParams()
        }
      },
      immediate: true,
      deep: true,
    },

    headersArray: {
      handler: function(value: HeaderObject[]) {
        const uniqHeaders = _.uniqBy(value, 'key')
        const emptyKey = uniqHeaders.find((header) => {
          return !header.key
        })
        if (uniqHeaders.length !== value.length || emptyKey) {
          return
        }
        this.localDoc.params.headers = _.reduce(value, (result, header) => {
          result[header.key] = header.value
          return result
        }, {} as CustomResponse['params']['headers'])
        this.emitDocUpdate()
      },
      deep: true,
    },

  },
  props: {
    selectedDoc: Object,
    apiPath: String,
  },
  data() {
    const selectedType = ['skip', 'custom', 'challenge', 'monitor']
    return {
      selectedType: selectedType,
      headersArray: [] as HeaderObject[],
    }
  },
  computed: {
    localDoc(): CustomResponse {
      return _.cloneDeep(this.selectedDoc as CustomResponse)
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
  },
  emits: ['update:selectedDoc'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    getHeadersArray(): HeaderObject[] {
      if (!this.localDoc?.params?.headers) {
        return []
      }
      return _.map(this.localDoc.params.headers, function(value, key) {
        return {key: key, value: value}
      })
    },

    removeHeaderElement(index: number): void {
      this.headersArray.splice(index, 1)
    },

    addHeaderElement(): void {
      this.headersArray.push({key: '', value: ''})
    },

    normalizeParams() {
      this.localDoc.params = {
        status: null,
        headers: {},
        content: '',
      }
      this.emitDocUpdate()
    },
  },
})
</script>
<style scoped lang="scss">
.inline {
  align-items: center;
  display: flex;
  margin-top: 5px;
}

.status-code {
  margin-right: 5px;
}

.name {
  display: inline-grid;
}

.content-textarea {
  display: flex;
}

.headers-columns,
.status-code {
  width: 50%;
}
</style>
