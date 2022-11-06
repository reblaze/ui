<template>
  <div class="card-content">
    <div class="content">
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
            <div class="columns columns-divided">
              <div class="column is-4">
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
                           data-qa="security-policies-name-input"
                           title="Document name"
                           placeholder="Document name"
                           @change="emitDocUpdate"
                           v-model="localDoc.name"/>
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">
                    Match Host/Authority Header
                  </label>
                  <div class="control has-icons-left">
                    <input type="text"
                           class="input is-small document-domain-name"
                           data-qa="security-policies-match-input"
                           placeholder="(api|service).company.(io|com)"
                           @change="emitDocUpdate"
                           @input="validateInput($event, isSelectedDomainMatchValid)"
                           v-model="localDoc.match"
                           :disabled="localDoc.id === '__default__'"
                           :readonly="localDoc.id === '__default__'"
                           title="Enter a regex to match hosts headers (domain names)">
                    <span class="icon is-small is-left has-text-grey"><i class="fas fa-code"></i></span>
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
                    <labeled-tags title="Automatic Tag"
                                  :tags="automaticTags"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">
                      Description
                    </label>
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
              </div>
            </div>
            <div class="column is-8">
              <div class="field">
                <label class="label is-small">
                  Main Session ID
                </label>
                <div class="control">
                  <limit-option selected-type-column-class="is-3"
                                v-model:option="sessionOption"
                                :key="sessionOption.type + localDoc.id"
                                :ignore-attributes="['session']"
                                @change="emitDocUpdate"/>
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Other Session IDs
                </label>
                <div class="control">
                  <limit-option v-for="(option, index) in localDoc.session_ids"
                                selected-type-column-class="is-3"
                                show-remove
                                @remove="removeSessionId(index)"
                                @change="updateSessionIdOption($event, index)"
                                :removable="true"
                                :ignore-attributes="['session']"
                                :option="generateOption(option)"
                                :key="getOptionTextKey(option, index)"/>
                  <a title="Add new session ID"
                     class="is-text is-small is-size-7 ml-3 add-session-id-button"
                     data-qa="add-new-session-id-btn"
                     tabindex="0"
                     @click="addSessionId()"
                     @keypress.space.prevent
                     @keypress.space="addSessionId()"
                     @keypress.enter="addSessionId()">
                    New entry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field px-3">
        <label class="label is-small">
          Path Mapping
        </label>
        <table class="table entries-table is-size-7">
          <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>
              <span>Match Path</span>
              &nbsp;
              <span><i class="fas fa-sort-alpha-down"></i></span>
            </th>
            <th>Content Filter</th>
            <th>ACL</th>
            <th>Rate Limits</th>
            <th></th>
          </tr>
          </thead>
          <tbody v-for="(mapEntry, mapIndex) in localDoc.map"
                 :key="mapIndex">
          <tr @click="changeSelectedMapEntry(mapIndex)"
              class="has-row-clickable entry-row"
              :class=" mapEntryIndex === mapIndex ? 'has-background-light borderless' : ''">
            <td class="width-20px has-text-right has-text-grey-light entry-index">
              {{ mapIndex + 1 }}
            </td>
            <td class="width-100px ellipsis entry-name"
                :title="mapEntry.name">
              {{ mapEntry.name }}
            </td>
            <td class="width-360px ellipsis entry-match"
                :title="mapEntry.match">
              {{ mapEntry.match }}
            </td>
            <td class="width-150px ellipsis entry-content-filter"
                :class="mapEntry.content_filter_active ? 'has-text-success' : 'has-text-danger'"
                :title="mapEntry.content_filter_active ? 'Active mode' : 'Learning mode'">
              {{ contentFilterProfileName(mapEntry.content_filter_profile) }}
            </td>
            <td class="width-150px ellipsis entry-acl"
                :class="mapEntry.acl_active ? 'has-text-success' : 'has-text-danger'"
                :title="mapEntry.acl_active ? 'Active mode' : 'Learning mode'">
              {{ aclProfileName(mapEntry.acl_profile) }}
            </td>
            <td class="width-100px entry-rate-limits-count"
                v-if="existingRateLimitIDs(mapEntry)">
              {{ existingRateLimitIDs(mapEntry).length }}
            </td>
            <td class="width-70px"
                :rowspan="mapEntryIndex === mapIndex ? '2' : '1'">
              <a class="has-text-grey"
                 title="more details"
                 data-qa="expand-path-btn">
                {{ mapEntryIndex === mapIndex ? 'close' : 'expand' }}
              </a>
            </td>
          </tr>
          <tr v-if="mapEntryIndex === mapIndex"
              :class=" mapEntryIndex === mapIndex ? 'has-background-light borderless' : ''"
              class="expanded current-entry-row">
            <td colspan="10">
              <div class="card">
                <div class="card-content">
                  <div class="content">
                    <div class="columns">
                      <div class="column is-8">
                        <div class="field">
                          <label class="label is-small">
                            Name
                            <span class="has-text-grey is-pulled-right map-entry-id"
                                  title="Map entry id">
                              {{ mapEntry.id }}
                            </span>
                          </label>
                          <div class="control">
                            <input v-model="mapEntry.name"
                                   class="input is-small current-entry-name"
                                   type="text"
                                   data-qa="expanded-path-name-input"
                                   ref="profileName"
                                   title="Name"
                                   :disabled="isProtectedEntry(mapEntry)"
                                   :readonly="isProtectedEntry(mapEntry)"
                                   @input="emitDocUpdate">
                          </div>
                        </div>
                        <div class="field">
                          <label class="label is-small">
                            Match Path
                          </label>
                          <div class="control has-icons-left">
                            <input v-model="mapEntry.match"
                                   class="input is-small current-entry-match"
                                   type="text"
                                   data-qa="expanded-path-input"
                                   placeholder="Matching domain(s) regex"
                                   ref="mapEntryMatch"
                                   :title="matchingDomainTitle"
                                   :disabled="isProtectedEntry(mapEntry)"
                                   :readonly="isProtectedEntry(mapEntry)"
                                   @input="emitDocUpdate();
                                               validateInput($event, isSelectedMapEntryMatchValid(mapIndex))">
                            <span class="icon is-small is-left has-text-grey">
                                  <i class="fas fa-code"></i>
                                </span>
                          </div>
                        </div>
                        <hr/>
                        <p class="title is-6 has-text-grey">
                          Rate Limit Rules
                        </p>
                        <div class="content">
                          <table class="table is-hoverable is-narrow is-fullwidth
                                            current-entry-rate-limits-table is-size-7">
                            <thead>
                            <tr>
                              <th class="width-250px">
                                Rule Name
                              </th>
                              <th class="width-200px">
                                Description
                              </th>
                              <th class="width-80px">
                                Timeframe
                              </th>
                              <th class="has-text-centered width-60px">
                                <a v-if="limitRuleNames && mapEntry.limit_ids &&
                                             limitRuleNames.length > existingRateLimitIDs(mapEntry).length"
                                   class="has-text-grey-dark is-small rate-limit-add-button"
                                   data-qa="add-existing-ratelimit"
                                   title="Add new"
                                   tabindex="0"
                                   @click="limitNewEntryModeMapEntryId = mapIndex"
                                   @keypress.space.prevent
                                   @keypress.space="limitNewEntryModeMapEntryId = mapIndex"
                                   @keypress.enter="limitNewEntryModeMapEntryId = mapIndex">
                                  <span class="icon is-small"><i class="fas fa-plus"></i></span>
                                </a>
                              </th>
                            </tr>
                            </thead>
                            <tbody>
                            <template v-for="(limitId, limitIndex) in mapEntry.limit_ids">
                              <tr v-if="limitDetails(limitId)"
                                  :key="limitId"
                                  class="rate-limit-row">
                                <td class="width-250px ellipsis rate-limit-name"
                                    v-if="limitDetails(limitId)"
                                    :title="limitDetails(limitId).name">
                                  {{ limitDetails(limitId).name }}
                                </td>
                                <td class="is-size-7 width-200px ellipsis rate-limit-description"
                                    v-if="limitDetails(limitId)"
                                    :title="limitDetails(limitId).description">
                                  {{ limitDetails(limitId).description }}
                                </td>
                                <td class="width-80px ellipsis rate-limit-timeframe"
                                    v-if="limitDetails(limitId)">
                                  {{ limitDetails(limitId).timeframe }}
                                </td>
                                <td class="has-text-centered width-60px">
                                  <a class="is-small has-text-grey rate-limit-remove-button"
                                     data-qa="remove-ratelimit-btn"
                                     title="Remove entry"
                                     tabindex="0"
                                     @click="removeRateLimitFromEntry(mapEntry, limitIndex)"
                                     @keypress.space.prevent
                                     @keypress.space="removeRateLimitFromEntry(mapEntry, limitIndex)"
                                     @keypress.enter="removeRateLimitFromEntry(mapEntry, limitIndex)">
                                    remove
                                  </a>
                                </td>
                              </tr>
                            </template>
                            <tr v-if="limitNewEntryMode(mapIndex)"
                                class="new-rate-limit-row">
                              <td colspan="3">
                                <div class="control is-expanded">
                                  <div class="select is-small is-fullwidth">
                                    <select class="select is-small new-rate-limit-selection"
                                            title="Rate limit ID"
                                            v-model="limitMapEntryId">
                                      <option v-for="rule in newLimitRules(mapEntry.limit_ids)"
                                              :key="rule.id"
                                              :value="rule.id">{{ rule.name + ' ' + rule.description }}
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                              <td class="has-text-centered width-60px">
                                <a class="is-small has-text-grey rate-limit-confirm-add-button"
                                   title="Add this entry"
                                   tabindex="0"
                                   @click="addRateLimitToEntry(mapEntry, limitMapEntryId)"
                                   @keypress.space.prevent
                                   @keypress.space="addRateLimitToEntry(mapEntry, limitMapEntryId)"
                                   @keypress.enter="addRateLimitToEntry(mapEntry, limitMapEntryId)">
                                  add
                                </a>
                              </td>
                            </tr>
                            <tr v-if="mapEntry.limit_ids && !existingRateLimitIDs(mapEntry).length">
                              <td colspan="5">
                                <p class="has-text-grey has-text-centered">
                                  To attach an existing rule, click
                                  <a class="rate-limit-text-add-button"
                                     title="Add New"
                                     @click="limitNewEntryModeMapEntryId = mapIndex">here</a>.
                                  <br/>
                                  To create a new rate-limit rule, click
                                  <a class="rate-limit-referral-button"
                                     @click="referToRateLimit">here</a>.
                                </p>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div class="column is-4">
                        <div class="field">
                          <label class="label is-small">Content Filter Profile</label>
                          <div class="control is-expanded">
                            <div class="select is-fullwidth is-small">
                              <select v-model="mapEntry.content_filter_profile"
                                      @change="emitDocUpdate"
                                      data-qa="content-filter-dropdown"
                                      class="current-entry-content-filter-selection"
                                      title="Content Filter profile">
                                <option v-for="contentfilter in contentFilterProfileNames"
                                        :value="contentfilter[0]"
                                        :key="contentfilter[0]">
                                  {{ contentfilter[1] }}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div class="field">
                          <label class="checkbox is-size-7">
                            <input type="checkbox"
                                   @change="emitDocUpdate"
                                   data-qa="content-filter-active-checkbox"
                                   class="current-entry-content-filter-active"
                                   v-model="mapEntry.content_filter_active">
                            Active Mode
                          </label>
                        </div>
                        <hr/>
                        <div class="field">
                          <label class="label is-small">
                            ACL Profile
                          </label>
                          <div class="control is-expanded">
                            <div class="select is-fullwidth is-small">
                              <select v-model="mapEntry.acl_profile"
                                      @change="emitDocUpdate"
                                      data-qa="acl-dropdown"
                                      class="current-entry-acl-selection"
                                      title="ACL profile">
                                <option v-for="acl in aclProfileNames"
                                        :value="acl[0]"
                                        :key="acl[0]">
                                  {{ acl[1] }}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div class="field">
                          <label class="checkbox is-size-7">
                            <input type="checkbox"
                                   @change="emitDocUpdate"
                                   data-qa="acl-active-checkbox"
                                   class="current-entry-acl-active"
                                   v-model="mapEntry.acl_active">
                            Active Mode
                          </label>
                        </div>
                        <hr/>
                        <div class="field">
                          <button title="Create a new profile based on this one"
                                  data-qa="fork-btn"
                                  class="button is-small is-pulled-left is-light fork-entry-button"
                                  @click="addNewProfile(mapEntry, mapIndex)">
                            <span class="icon"><i class="fas fa-code-branch"></i></span>
                            <span>
                                  Fork profile
                                </span>
                          </button>
                          <button title="Delete this profile"
                                  data-qa="delete-location-btn"
                                  class="button is-small is-pulled-right is-danger is-light remove-entry-button"
                                  @click="removeMapEntry(mapIndex)"
                                  v-if="!isProtectedEntry(mapEntry)">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {defineComponent} from 'vue'
import {
  ACLProfile,
  ContentFilterProfile,
  LimitOptionType,
  LimitRuleType,
  RateLimit,
  SecurityPolicy,
  SecurityPolicyEntryMatch,
} from '@/types'
import {AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import LabeledTags from '@/components/LabeledTags.vue'
import LimitOption, {OptionObject} from '@/components/LimitOption.vue'

export default defineComponent({
  name: 'SecurityPoliciesEditor',
  components: {
    LabeledTags,
    LimitOption,
    TagAutocompleteInput,
  },
  props: {
    selectedDoc: Object,
    selectedBranch: String,
    docs: Array,
    apiPath: String,
  },

  data() {
    return {
      mapEntryIndex: -1,

      // for SecurityPolicy drop downs
      contentFilterProfileNames: [] as [ContentFilterProfile['id'], ContentFilterProfile['name']][],
      aclProfileNames: [] as [ACLProfile['id'], ACLProfile['name']][],
      limitRuleNames: [] as RateLimit[],
      entriesMatchNames: [] as SecurityPolicyEntryMatch['match'][],

      limitNewEntryModeMapEntryId: null,
      limitMapEntryId: null,
      initialMapEntryMatch: '',
      upstreams: [],

      // titles
      matchingDomainTitle: 'A unique matching regex value, not overlapping other Security Policy definitions',

      // collapsed
      isDataCollapsed: false,
    }
  },

  watch: {
    selectedDoc: {
      handler: function(value) {
        if (!value['session']) {
          this.normalizeDocSession()
        }
        if (!value['session_ids']) {
          this.normalizeDocSessionIds()
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    localDoc(): SecurityPolicy {
      return _.cloneDeep(this.selectedDoc as SecurityPolicy)
    },

    selectedDocTags: {
      get: function(): string {
        if (this.localDoc.tags && this.localDoc.tags.length > 0) {
          return this.localDoc.tags.join(' ')
        }
        this.$emit('tags-invalid', true)
        return ''
      },
      set: function(tags: string): void {
        this.localDoc.tags = tags.length > 0 ? _.map(tags.split(' '), (tag) => {
          return tag.trim()
        }) : []
        if (tags.trim() == '' || tags.length < 3) {
          this.$emit('tags-invalid', true)
        } else {
          this.$emit('tags-invalid', false)
        }
        this.emitDocUpdate()
      },
    },

    automaticTags(): string[] {
      const nameTag = `securitypolicy:${this.localDoc.name?.replace(/ /g, '-') || ''}`
      return [nameTag]
    },

    sessionOption: {
      get: function(): LimitOptionType {
        return this.generateOption(this.localDoc.session[0])
      },
      set: function(value: LimitOptionType): void {
        this.localDoc.session[0] = value
        this.emitDocUpdate()
      },
    },

    isFormInvalid(): boolean {
      const isDomainMatchValid = this.isSelectedDomainMatchValid()
      // Entries are reverted to valid state on close, so if no entry is opened they are valid
      const isCurrentEntryMatchValid = this.mapEntryIndex === -1 ||
          this.isSelectedMapEntryMatchValid(this.mapEntryIndex)
      return !isDomainMatchValid || !isCurrentEntryMatchValid
    },
  },
  emits: ['update:selectedDoc', 'form-invalid', 'tags-invalid'],
  methods: {
    emitDocUpdate(): void {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    emitCurrentDocInvalidity(): void {
      this.$emit('form-invalid', this.isFormInvalid)
    },

    validateInput(event: Event, validator: Function | boolean) {
      const isValid = Utils.validateInput(event, validator)
      if (!isValid) {
        this.$emit('form-invalid', true)
      } else {
        this.emitCurrentDocInvalidity()
      }
    },

    // isURLValid(url: string) {
    //   const URL_REGEX = /^[A-Za-z0-9%-._~:/?#[\]@!$&'()*+,;=|]*$/g
    //   return URL_REGEX.test(url)
    // },

    isSelectedDomainMatchValid(): boolean {
      const newDomainMatch = this.localDoc.match.trim()
      const isDomainMatchEmpty = newDomainMatch === ''
      // TODO: Fix regex test for rust standards and re-apply this
      // const domainMatchContainsInvalidCharacters = !this.isURLValid(newDomainMatch)
      // return !isDomainMatchEmpty && !isDomainMatchDuplicate && !domainMatchContainsInvalidCharacters
      return !isDomainMatchEmpty
    },

    isSelectedMapEntryMatchValid(index: number): boolean {
      const newMapEntryMatch = this.localDoc.map[index].match.trim() || ''
      const isMapEntryMatchEmpty = newMapEntryMatch === ''
      const isMapEntryMatchDuplicate = this.entriesMatchNames.includes(
          newMapEntryMatch,
      ) ? this.initialMapEntryMatch !== newMapEntryMatch : false
      // TODO: Fix regex test for rust standards and re-apply this
      // const mapEntryMatchContainsInvalidCharacters = !this.isURLValid(newMapEntryMatch.substring(1))
      // isValid = !isMapEntryMatchEmpty && !isMapEntryMatchDuplicate && !mapEntryMatchContainsInvalidCharacters
      return !isMapEntryMatchEmpty && !isMapEntryMatchDuplicate
    },

    aclProfileName(id: string): string {
      const profile = _.find(this.aclProfileNames, (profile) => profile[0] === id)
      return profile?.[1] || ''
    },

    contentFilterProfileName(id: string): string {
      const profile = _.find(this.contentFilterProfileNames, (profile) => profile[0] === id)
      return profile?.[1] || ''
    },

    newLimitRules(currentRateLimitIDs: string[]): RateLimit[] {
      return _.filter(this.limitRuleNames, (rule) => {
        return _.indexOf(currentRateLimitIDs, rule.id) === -1
      })
    },

    addRateLimitToEntry(mapEntry: SecurityPolicyEntryMatch, id: string) {
      if (id) {
        mapEntry.limit_ids.push(id)
        this.limitNewEntryModeMapEntryId = null
        this.limitMapEntryId = null
        this.emitDocUpdate()
      }
    },

    removeRateLimitFromEntry(mapEntry: SecurityPolicyEntryMatch, index: number) {
      mapEntry.limit_ids.splice(index, 1)
      this.emitDocUpdate()
    },

    limitDetails(limitId: string): RateLimit {
      return _.find(this.limitRuleNames, (rule) => {
        return rule.id === limitId
      })
    },

    limitNewEntryMode(id: number): boolean {
      return this.limitNewEntryModeMapEntryId === id
    },

    existingRateLimitIDs(mapEntry: SecurityPolicyEntryMatch): RateLimit['id'][] {
      return _.filter(mapEntry.limit_ids, (limitId) => {
        return this.limitDetails(limitId) !== undefined
      })
    },

    addNewProfile(mapEntry: SecurityPolicyEntryMatch, idx: number) {
      const newMapEntry = _.cloneDeep(mapEntry)
      const newMapEntryId = DatasetsUtils.generateUUID2()
      newMapEntry.id = newMapEntryId
      newMapEntry.name = 'New Security Profile'
      newMapEntry.match = `/new/path/to/match/profile/${newMapEntryId}`

      // reverting the entry match to a stable and valid state if invalid
      if (!this.isSelectedMapEntryMatchValid(idx)) {
        this.localDoc.map[idx].match = this.initialMapEntryMatch
        Utils.clearInputValidationClasses(this.$refs.mapEntryMatch[0])
        this.emitCurrentDocInvalidity()
      }
      this.localDoc.map.splice(idx, 0, newMapEntry)
      this.emitDocUpdate()
      const element = this.$refs.profileName[0] as HTMLInputElement
      this.initialMapEntryMatch = newMapEntry.match
      this.entriesMatchNames = _.map(this.localDoc.map, 'match')
      // Pushing the select action to the end of queue in order for the new profile to be rendered beforehand
      setImmediate(() => {
        element.select()
        element.focus()
      })
    },

    changeSelectedMapEntry(index: number) {
      // reverting the entry match to a stable and valid state if invalid on close
      if (this.mapEntryIndex !== -1 && !this.isSelectedMapEntryMatchValid(this.mapEntryIndex)) {
        if (this.localDoc.map[this.mapEntryIndex]) {
          this.localDoc.map[this.mapEntryIndex].match = this.initialMapEntryMatch
        }
        this.mapEntryIndex = (this.mapEntryIndex === index ? -1 : index)
        Utils.clearInputValidationClasses(this.$refs.mapEntryMatch[0])
        this.emitDocUpdate()
        this.emitCurrentDocInvalidity()
      } else {
        this.mapEntryIndex = (this.mapEntryIndex === index ? -1 : index)
      }
      this.initialMapEntryMatch = this.localDoc.map[index] ? this.localDoc.map[index].match.trim() : ''
      this.entriesMatchNames = _.map(this.localDoc.map, 'match')
    },

    isProtectedEntry(mapEntry: SecurityPolicyEntryMatch): boolean {
      return mapEntry.id.startsWith('__')
    },

    removeMapEntry(index: number) {
      this.changeSelectedMapEntry(-1)
      this.localDoc.map.splice(index, 1)
      this.emitDocUpdate()
    },

    referToRateLimit() {
      this.$router.push(`/${this.selectedBranch}/ratelimits/list`)
    },

    contentfilteracllimitProfileNames() {
      const branch = this.selectedBranch

      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${branch}/d/contentfilterprofiles/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ContentFilterProfile[]>) => {
        this.contentFilterProfileNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })

      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${branch}/d/aclprofiles/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ACLProfile[]>) => {
        this.aclProfileNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })

      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${branch}/d/ratelimits/`,
      }).then((response: AxiosResponse<RateLimit[]>) => {
        this.limitRuleNames = response.data
      })
    },

    normalizeDocSession() {
      this.localDoc.session = []
      this.emitDocUpdate()
    },

    normalizeDocSessionIds() {
      this.localDoc.session_ids = []
      this.emitDocUpdate()
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

    addSessionId() {
      this.localDoc.session_ids.push({attrs: 'ip'})
      this.emitDocUpdate()
    },

    removeSessionId(index: number) {
      if (this.localDoc.session_ids.length > 1) {
        this.localDoc.session_ids.splice(index, 1)
      }
      this.emitDocUpdate()
    },

    updateSessionIdOption(option: OptionObject, index: number) {
      this.localDoc.session_ids.splice(index, 1, {
        [option.type]: option.key,
      })
      this.emitDocUpdate()
    },
  },

  created() {
    this.contentfilteracllimitProfileNames()
  },
})
</script>
<style scoped
       lang="scss">

.has-row-clickable > td {
  cursor: pointer;
}

.borderless > td {
  border-bottom-width: 0;
  padding-top: 8px;
}

.expanded > td {
  padding-bottom: 20px;
}

.new-rate-limit-row > td {
  vertical-align: middle;
}

tr:last-child > td {
  border-bottom-width: 1px;
}

.borderless:last-child > td {
  border-bottom-width: 0;
}

</style>
