<template>
  <section>
    <div class="card">
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
                         data-qa="ratelimit-name-input"
                         title="Document name"
                         placeholder="Document name"
                         @change="emitDocUpdate"
                         v-model="localDoc.name"/>
                </div>
              </div>
              <div class="field">
                <label class="checkbox is-size-7">
                  <input type="checkbox"
                         data-qa="global-checkbox"
                         class="document-global"
                         @change="emitDocUpdate"
                         v-model="localDoc.global">
                  Global
                </label>
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
              <div class="field">
                <label class="label is-small">
                  Time Frame
                </label>
                <div class="control suffix seconds-suffix">
                  <input class="input is-small document-timeframe"
                         data-qa="ratelimit-timeframe-input"
                         type="number"
                         title="Rate limit duration"
                         placeholder="Rate limit duration"
                         @change="emitDocUpdate"
                         v-model.number="localDoc.timeframe">
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
              <div class="group-key mb-3">
                <limit-option v-for="(option, index) in localDoc.key"
                              label-separated-line
                              :label="index === 0 ? 'Count by' : ' '"
                              show-remove
                              @remove="removeKey(index)"
                              @change="updateKeyOption($event, index)"
                              :removable="localDoc.key.length > 1"
                              :ignore-attributes="['tags']"
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
              <div class="group-event mb-3">
                <limit-option use-default-self
                              label-separated-line
                              label="Event"
                              v-model:option="eventOption"
                              :key="eventOption.type + localDoc.id"
                              :ignore-attributes="['tags']"
                              @change="updateEvent"/>
              </div>
              <div class="field">
                <label class="label is-small">
                  Thresholds
                </label>
                <div v-for="(threshold, index) in localDoc.thresholds"
                     :key="index"
                     :set="removable = localDoc.thresholds.length > 1"
                     class="card threshold-card">
                  <div class="columns">
                    <div class="column is-6">
                      <label class="label is-small">
                        Limit
                      </label>
                      <input class="input is-small document-limit"
                             type="number"
                             data-qa="ratelimit-limit-input"
                             title="Number of events"
                             placeholder="Number of events"
                             @change="emitDocUpdate"
                             v-model.number="threshold.limit">
                    </div>
                    <div class="button-wrapper-column column">
                      <a
                          :class="[removable ? 'has-text-grey' : 'has-text-grey-light is-disabled']"
                          :disabled="!removable"
                          class="remove-threshold-option-button is-pulled-right button is-light is-small
                            remove-icon is-small"
                          title="Click to remove"
                          @click="removeThreshold(index)"
                          @keypress.space.prevent
                          @keypress.space="removeThreshold(index)"
                          @keypress.enter="removeThreshold(index)">
                        <span class="icon is-small"><i class="fas fa-trash fa-xs"></i></span>
                      </a>
                    </div>
                  </div>
                  <div class="field">
                    <label class="label is-small">
                      Action
                    </label>
                    <div class="control is-expanded">
                      <div class="select is-fullwidth is-small">
                        <select v-model="threshold.action"
                                @change="emitDocUpdate"
                                data-qa="action-dropdown"
                                class="threshold-action-selection"
                                title="Action">
                          <option v-for="customResponse in customResponseNames"
                                  :value="customResponse[0]"
                                  :key="customResponse[0]">
                            {{ customResponse[1] }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <a title="Add new threshold"
                   data-qa="add-another-threshold-btn"
                   class="is-text is-small is-size-7 ml-3 add-threshold-button"
                   tabindex="0"
                   @click="addThreshold()"
                   @keypress.space.prevent
                   @keypress.space="addThreshold()"
                   @keypress.enter="addThreshold()">
                  New threshold
                </a>
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
                          :class=" duplicateTags[tag] ? 'has-text-danger' : '' "
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
                                                @tag-submitted="addNewTag(filter, $event)">
                        </tag-autocomplete-input>
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
          <!--// div class="container" >
            <button type="button" class="collapsible" @click="toggleRecommendation">Rate Limit Recommendations</button>
            <div class="content" v-if="accordion">
              <div v-for="c of recommendations" :key="c.title">
                  <p>{{ c.title }}</p>
                  <p>{{ c.description }}</p>
              </div>
            </div>
          <///-->
          <security-policies-connections
            selectedDocType="ratelimits"
            :selectedDocId="localDoc.id"
            @go-to-route="emitGoToRoute"
            :selectedBranch="selectedBranch">
          </security-policies-connections>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import _ from 'lodash'
import LimitOption, {OptionObject} from '@/components/LimitOption.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import SecurityPoliciesConnections from '@/components/SecurityPoliciesConnections.vue'
import {defineComponent} from 'vue'
import {
  CustomResponse,
  Dictionary,
  IncludeExcludeType,
  LimitOptionType,
  LimitRuleType,
  RateLimit,
  ThresholdActionPair,
} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosResponse} from 'axios'

export default defineComponent({
  name: 'RateLimits',
  props: {
    selectedBranch: String,
    selectedDoc: Object,
    apiPath: String,
  },
  components: {
    LimitOption,
    TagAutocompleteInput,
    SecurityPoliciesConnections,
  },
  data() {
    return {
      filters: ['include', 'exclude'] as IncludeExcludeType[],
      addNewTagColName: null,
      titles: DatasetsUtils.titles,
      keysAreValid: true,
      removable: false,
      customResponseNames: [] as [CustomResponse['id'], CustomResponse['name']][],
    }
  },
  computed: {
    localDoc(): RateLimit {
      return _.cloneDeep(this.selectedDoc as RateLimit)
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

    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['include'], doc['exclude'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      return _.fromPairs(_.zip(dupTags, dupTags))
    },

    eventOption: {
      get: function(): LimitOptionType {
        return this.generateOption(this.localDoc.pairwith)
      },
      set: function(value: RateLimit['pairwith']): void {
        this.localDoc.pairwith = value
        this.emitDocUpdate()
      },
    },
  },
  emits: ['update:selectedDoc', 'go-to-route'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
    emitGoToRoute(url: string) {
      this.$emit('go-to-route', url)
    },

    getOptionTextKey(option: LimitOptionType, index: number) {
      if (!option) {
        return ''
      }
      const [type] = Object.keys(option)
      return `${this.localDoc.id}_${type}_${index}`
    },

    generateOption(data: LimitOptionType): OptionObject {
      if (!data) {
        return {}
      }
      const [firstObjectKey] = Object.keys(data)
      const type = firstObjectKey as LimitRuleType
      const key = data[firstObjectKey]
      return {type, key, value: null}
    },

    addThreshold() {
      this.localDoc.thresholds.push({limit: 0, action: 'default'} as ThresholdActionPair)
      this.emitDocUpdate()
    },

    removeThreshold(index: number) {
      if (this.localDoc.thresholds.length > 1) {
        this.localDoc.thresholds.splice(index, 1)
      }
      this.emitDocUpdate()
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

    checkKeysValidity() {
      const keysToCheck = _.countBy(this.localDoc.key, (item) => {
        if (!item) {
          return ''
        }
        const key = Object.keys(item)[0]
        return `${key}_${item[key]}`
      })
      this.keysAreValid = true
      for (const key of Object.keys(keysToCheck)) {
        if (keysToCheck[key] > 1 || keysToCheck[''] > 0) {
          this.keysAreValid = false
          break
        }
      }
      return this.keysAreValid
    },

    updateEvent(option: OptionObject) {
      this.eventOption = {[option.type]: option.key}
    },

    addNewTag(section: IncludeExcludeType, entry: string) {
      if (entry && entry.length > 2) {
        // this.localDoc[section].push(entry)
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
      // this.localDoc[section].splice(index, 1)
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

  mounted() {
    this.checkKeysValidity()
  },

  created() {
    this.loadCustomResponses()
  },
})
</script>

<style scoped lang="scss">

/* Style the collapsible content. Note: hidden by default */
.content {
  background-color: #f1f1f1;
  display: none;
  overflow: hidden;
  padding: 0 18px;
}

.collapsible {
  background-color: #eee;
  border: 'none';
  color: #444;
  cursor: pointer;
  font-size: 15px;
  outline: 'none';
  padding: 18px;
  text-align: left;
  width: 100%;
}

.active,
.collapsible:hover {
  background-color: #ccc;
}

.form-label {
  padding-top: 0.25rem;
}

.bar {
  margin: 1rem 0 0.5rem;
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
