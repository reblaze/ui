<template>
  <div class="card-content">
    <div class="content">
      <div class="columns columns-divided">
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
                                rows="2">
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
                      @change="normalizeParams()">
                <option v-for="name in customResponseTypes"
                        :key="name"
                        :value="name">
                  {{ capitalize(name) }}
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
                                      @invalid="emitFormInvalid"
                                      @tag-changed="selectedDocTags = $event"
                                      class="document-autocomplete-input" />
            </div>
          </div>
        </div>
        <div v-if="['monitor', 'custom'].includes(localDoc.type)"
             class="column is-8">
          <div class="custom-panel">
            <div v-if="localDoc.type === 'custom'"
                 class="field">
              <label class="label is-small status-code-label">
                Status code
              </label>
              <div class="columns mb-0">
                <div class="column is-3 pb-0">
                  <input class="input is-small document-status-code"
                         data-qa="status-input"
                         type="number"
                         title="Status code"
                         placeholder="Status code"
                         @change="emitDocUpdate"
                         v-model.number="localDoc.params.status"/>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label is-small is-size-7 has-text-left form-label">
                {{ localDoc.type === 'custom' ? 'Response' : 'Request' }} Headers
              </label>
              <div v-for="(header, index) in headersArray"
                   :key="index"
                   class="columns mb-0 headers-columns">
                <div class="column is-3">
                  <input class="input is-small document-header-key"
                         title="Header key"
                         placeholder="Header key"
                         v-model="header.key"/>
                </div>
                <div class="column">
                  <input class="input is-small document-header-value"
                         title="Header value"
                         placeholder="Header value"
                         v-model="header.value"/>
                </div>
                <div class="column is-narrow">
                  <button class="button is-light is-small remove-icon is-small has-text-grey"
                          title="Click to remove header"
                          @click="removeHeaderElement(index)">
                    <span class="icon is-small"><i class="fas fa-trash fa-xs"></i></span>
                  </button>
                </div>
              </div>
              <a title="Add new header"
                 class="is-text is-small is-size-7 ml-3 add-key-button"
                 data-qa="add-new-key-btn"
                 tabindex="0"
                 @keypress.space.prevent
                 @click="addHeaderElement()">
                New entry
              </a>
            </div>
            <div v-if="localDoc.type === 'custom'"
                 class="field">
              <label class="label is-small">
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
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
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
        if (!value['params'] && ['monitor', 'custom'].includes(value['type'])) {
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
    const customResponseTypes = ['skip', 'custom', 'challenge', 'monitor']
    return {
      customResponseTypes: customResponseTypes,
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
  emits: ['update:selectedDoc', 'form-invalid'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitFormInvalid(isFormInvalid: boolean) {
      this.$emit('form-invalid', isFormInvalid)
    },

    getHeadersArray(): HeaderObject[] {
      if (!this.localDoc.params?.headers) {
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

    capitalize(value: string) {
      return _.capitalize(value)
    },

    normalizeParams() {
      this.localDoc.params = {}
      this.emitDocUpdate()
    },
  },
})
</script>
<style scoped lang="scss">
</style>
