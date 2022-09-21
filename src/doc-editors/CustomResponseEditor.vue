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
                </div>
                <div class="field">
                  <div class="control">
                    <input class="input is-small document-name"
                           data-qa="list-name-input"
                           title="List name"
                           placeholder="List name"
                           @change="emitDocUpdate"
                           v-model="localDoc.name"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Description</label>
                    <div class="control">
                      <textarea class="is-small textarea document-description"
                                title="Description"
                                rows="5"
                                @change="emitDocUpdate"
                                v-model="localDoc.description">
                      </textarea>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">Type</label>
                  <div class="select is-small">
                    <select v-model="selected"
                            title="Switch selections"
                            @change="switchType()">
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
                  <div class="control">
                    <tag-autocomplete-input class="is-small document-source"
                           data-qa="source-input"
                           title="List source"
                           placeholder="List source"
                           @change="emitDocUpdate"
                           v-model="localDoc.tags"/>
                  </div>
                </div>
              </div>
              <div v-show= "showCustomResponse" class="column is-9">
                <div class="field">
                    <label class="label is-small status-code">
                        Status code
                    </label>
                    <input type="textarea"
                    data-qa="active-checkbox"
                    class="document-active">
                </div>
                <div class="field">
                  <label class="label is-small is-size-7 has-text-left form-label">
                    Headers
                  </label>
                    <div v-for="(header, index) in headersArray" :key="header.key"
                         class="columns mb-0 headers-columns">
                      <div class="column">
                        <input class="input is-small document-header-key"
                                title="Header key"
                                placeholder="Header key"
                                v-model="header.key"/>
                      </div>
                      <div class="column">
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
                    <label class="label is-small status-code">
                        Content
                    </label>
                    <textarea type="textarea"
                    data-qa="active-checkbox"
                    class="is-small textarea"
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
    headersArray: {
      handler: function(value: HeaderObject[]) {
        const uniqHeaders = _.uniqBy(value, 'key')
        const emptyKey = uniqHeaders.find((header) => {
          return !header.key
        })
        if (uniqHeaders.length !== value.length || emptyKey) {
          return
        }
        this.localDoc.params.headers = _.reduce(value, (result:CustomResponse['params']['headers'], header) => {
          result[header.key] = header.value
          return result
        }, {})
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
      selected: 'skip',
      showCustomResponse: true,
      headersArray: [] as HeaderObject[],
    }
  },
  computed: {
    localDoc(): CustomResponse {
      return _.cloneDeep(this.selectedDoc as CustomResponse)
    },
  },
  emits: ['update:selectedDoc'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
    switchType() {
      console.log(this.selected)
      this.selected === 'custom' ? this.showCustomResponse = true : this.showCustomResponse = false
      console.log(this.showCustomResponse)
    },
    getHeadersArray(): HeaderObject[] {
      if (!this.localDoc?.params?.headers) {
        return []
      }
      return _.map(this.localDoc.params.headers, function(value, key) {
        return {key: key, value: value}
      })
    },
    removeHeaderElement(index:number) :void {
      this.headersArray.splice(index, 1)
    },
    addHeaderElement() :void {
      this.headersArray.push({key: '', value: ''})
    },
  },
  created() {
    this.headersArray = this.getHeadersArray()
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

  .headers-columns {
    width: 50%;
  }
</style>
