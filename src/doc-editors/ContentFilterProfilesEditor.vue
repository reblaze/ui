<template>
  <div class="card-content">
    <div class="columns columns-divided pb-6">
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
                   title="Document name"
                   data-qa="waf-document-name"
                   placeholder="Document name"
                   @change="emitDocUpdate"
                   v-model="localDoc.name"/>
          </div>
        </div>
        <div class="field">
          <label class="label is-small">
            Masking Seed
          </label>
          <div class="control">
            <input class="input is-small document-masking-seed"
                   title="Masking seed"
                   data-qa="waf-masking"
                   placeholder="Masking seed"
                   @focus="maskingSeedHidden = false"
                   @blur="maskingSeedHidden = true"
                   v-model="maskingSeed"/>
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
                                    :selection-type="'multiple'"
                                    @tag-changed="selectedDocTags = $event" />
          </div>
          <labeled-tags title="Automatic Tags"
                        :tags="automaticTags" />
        </div>
        <div class="field ignore-alphanumeric-input-field"
             :title="additionalInfoIgnoreAlphanumericInput">
          <label class="checkbox is-size-7">
            <input type="checkbox"
                   data-qa="ignore-alphanumeric-btn"
                   class="checkbox-input ignore-alphanumeric-input"
                   @change="emitDocUpdate"
                   v-model="localDoc.ignore_alphanum"/>
            Ignore Alphanumeric Input
          </label>
          <span class="icon is-small info-icon">
                <i class="fas fa-info-circle"></i>
              </span>
        </div>
        <div class="field ignore-body-input-field">
          <label class="checkbox is-size-7">
            <input type="checkbox"
                   data-qa="ignore-body-btn"
                   class="checkbox-input ignore-body-input"
                   @change="emitDocUpdate"
                   v-model="localDoc.ignore_body"/>
            Ignore Body
          </label>
        </div>
      </div>
      <div class="column is-4">
        <div class="field">
          <label class="label is-small"
                 :title="additionalInfoContentType"
                 data-qa="restrict-content-type-label">
            Restrict Content Type
            <span class="icon is-small info-icon">
                  <i class="fas fa-info-circle"></i>
                </span>
          </label>
          <div class="control">
            <div v-for="contentTypeOption in contentTypeOptions"
                 :key="contentTypeOption.value"
                 class="content-type-option-wrapper mb-3">
              <label class="checkbox is-size-7">
                <input type="checkbox"
                       @change="updateContentType(contentTypeOption.value, $event)"
                       class="checkbox-input"
                       :data-qa="`content-type-${contentTypeOption.value}-checkbox`"
                       :class="`content-type-${contentTypeOption.value}-input`"
                       :checked="getContentTypeStatus(contentTypeOption.value)">
                {{ contentTypeOption.displayName }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-4">
        <div class="field">
          <label class="label is-small"
                 data-qa="field-label">
            Decoding
          </label>
          <div class="control">
            <div v-for="decodingOption in decodingOptions"
                 :key="decodingOption.value"
                 class="decoding-option-wrapper mb-3">
              <label class="checkbox is-size-7">
                <input type="checkbox"
                       @change="emitDocUpdate"
                       class="checkbox-input"
                       :data-qa="`decoding-${decodingOption.value}-checkbox`"
                       :class="`decoding-${decodingOption.value}-input`"
                       v-model="localDoc.decoding[decodingOption.value]">
                {{ decodingOption.displayName }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tag-lists-wrapper pb-6">
      <div class="columns mb-0">
        <div class="column is-4"
             v-for="section in sections"
             :key="section">
          <p class="title is-7 is-uppercase"
             :data-qa="`tag-${section}`">{{ titles[section] }}</p>
          <hr class="bar"
              :class="`bar-${section}`"/>
          <table class="table is-narrow is-fullwidth">
            <tbody>
            <tr v-for="(tag, idx) in localDoc[section]"
                :key="idx">
              <td class="tag-cell ellipsis"
                  :data-qa="`${tag}`"
                  :class=" { 'has-text-danger': duplicateTags[tag] }"
                  :title="tagMessage(tag) || tag">
                {{ tag }}
              </td>
              <td class="is-size-7 width-20px">
                <a title="remove entry"
                   data-qa="remove-tag-entry-btn"
                   tabindex="0"
                   class="is-small has-text-grey remove-tag-entry-button"
                   @click="removeTag(section, idx)"
                   @keypress.space.prevent
                   @keypress.space="removeTag(section, idx)"
                   @keypress.enter="removeTag(section, idx)">
                  &ndash;
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <tag-autocomplete-input
                    v-if="addNewColName === section"
                    selection-type="single"
                    title="Tag"
                    :minimum-value-length="2"
                    :clear-input-after-selection="true"
                    :auto-focus="true"
                    @keydown.esc="cancelAddNewTag"
                    @tag-submitted="addTag(section, $event)"/>
              </td>
              <td class="is-size-7 width-20px">
                <a title="add new entry"
                   data-qa="new-tag-entry-btn"
                   tabindex="0"
                   class="is-size-7 width-20px is-small has-text-grey add-new-tag-entry-button"
                   @click="openTagInput(section)"
                   @keypress.space.prevent
                   @keypress.space="openTagInput(section)"
                   @keypress.enter="openTagInput(section)">
                  +
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <p class="has-text-danger is-size-7 tags-invalid"
           v-if="tagsInvalid">
          Content Filter Profile does not contain any tags, Content Filter Rules will be ineffective.
        </p>
      </div>
    </div>
    <div class="tile is-ancestor px-3 py-3 mx-0 my-0">
      <div class="tile is-12">
        <table class="table is-fullwidth">
          <thead>
          <tr>
            <th></th>
            <th class="has-text-centered">Headers</th>
            <th class="has-text-centered">Cookies</th>
            <th class="has-text-centered">Arguments</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Max Length</td>
            <td>
              <input required
                     class="input is-small max-header-length-input"
                     data-qa="max-header-length-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max header length"
                     v-model.number="localDoc.headers.max_length"/>
            </td>
            <td>
              <input required
                     class="input is-small max-cookie-length-input"
                     data-qa="max-cookies-length-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max cookie length"
                     v-model.number="localDoc.cookies.max_length"/>
            </td>
            <td>
              <input required
                     class="input is-small max-arg-length-input"
                     data-qa="max-argument-length-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max argument length"
                     v-model.number="localDoc.args.max_length"/>
            </td>
          </tr>
          <tr>
            <td>Max Count</td>
            <td>
              <input required
                     class="input is-small max-headers-count-input"
                     data-qa="max-header-count-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max headers count"
                     v-model.number="localDoc.headers.max_count"/>
            </td>
            <td>
              <input required
                     class="input is-small max-cookies-count-input"
                     data-qa="max-cookies-count-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max cookies count"
                     v-model.number="localDoc.cookies.max_count"/>
            </td>
            <td>
              <input required
                     class="input is-small max-args-count-input"
                     data-qa="max-argument-count-input"
                     type="number"
                     @change="emitDocUpdate"
                     title="Max arguments count"
                     v-model.number="localDoc.args.max_count"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="tile is-ancestor px-3 py-3 mx-0 my-0">
      <div class="tile is-parent">
        <div class="tile is-12">
          <table class="table is-fullwidth">
            <tr>
              <td>
                <div class="tabs is-centered">
                  <ul>
                    <li :class=" tab === 'headers' ? 'is-active' : '' "
                        class="headers-tab"
                        data-qa="headers-tab-btn">
                      <a tabindex="0"
                         @click='tab="headers"'
                         @keypress.space.prevent
                         @keypress.space='tab="headers"'
                         @keypress.enter='tab="headers"'>
                        Headers
                      </a>
                    </li>
                    <li :class=" tab === 'cookies' ? 'is-active' : '' "
                        class="cookies-tab"
                        data-qa="cookies-tab-btn">
                      <a tabindex="0"
                         @click='tab="cookies"'
                         @keypress.space.prevent
                         @keypress.space='tab="cookies"'
                         @keypress.enter='tab="cookies"'>
                        Cookies
                      </a>
                    </li>
                    <li :class=" tab === 'args' ? 'is-active' : '' "
                        class="args-tab"
                        data-qa="arguments-tab-btn">
                      <a tabindex="0"
                         @click='tab="args"'
                         @keypress.space.prevent
                         @keypress.space='tab="args"'
                         @keypress.enter='tab="args"'>
                        Arguments
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <table class="table is-fullwidth is-hoverable"
                       v-if="localDoc && localDoc[tab]">
                  <thead>
                  <tr>
                    <th class="has-text-centered width-30pct">Parameter</th>
                    <th class="has-text-centered width-25pct">Matching Value</th>
                    <th class="has-text-centered width-5pct">Restrict?</th>
                    <th class="has-text-centered width-5pct">Mask?</th>
                    <th class="has-text-centered width-30pct">Ignore Content Filter Tags</th>
                    <th class="has-text-centered width-5pct">
                      <a v-show="newContentFilterLine !== tab"
                         class="has-text-grey-dark is-small new-parameter-button"
                         data-qa="add-new-parameter-btn"
                         title="Add new parameter"
                         tabindex="0"
                         @click="openAddNewParameter(tab)"
                         @keypress.space.prevent
                         @keypress.space="openAddNewParameter(tab)"
                         @keypress.enter="openAddNewParameter(tab)">
                        <span class="icon is-small"><i class="fas fa-plus"></i></span>
                      </a>
                      <a v-show="newContentFilterLine === tab"
                         class="has-text-grey-dark is-small cancel-new-parameter"
                         title="Cancel adding new parameter"
                         data-qa="cancel-new-parameter-btn"
                         tabindex="0"
                         @click="cancelNewParameter"
                         @keypress.space.prevent
                         @keypress.space="cancelNewParameter"
                         @keypress.enter="cancelNewParameter">
                        <span class="icon is-small"><i class="fas fa-minus"></i></span>
                      </a>
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="newContentFilterLine === tab"
                      class="has-background-warning-light new-parameter-row">
                    <td class="px-0 py-0 width-30pct">
                      <table class="table is-fullwidth has-background-warning-light">
                        <tr>
                          <td class="is-fullwidth">
                            <div class="field">
                              <div class="control">
                                <div class="select is-small">
                                  <select v-model="newEntry.type"
                                          data-qa="add-new-entry-btn"
                                          class="new-entry-type"
                                          title="Type">
                                    <option value="names"
                                            data-qa="parameter-name-dropdown">
                                      {{ titles.names }}
                                    </option>
                                    <option value="regex"
                                            data-qa="paramater-regex-dropdown">
                                      {{ titles.regex }}
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div class="field">
                              <div class="control">
                                <div>
                                  <input required
                                         class="input is-small new-entry-key"
                                         data-qa="new-key-input"
                                         :class="{ 'is-danger': !newEntry.key && newEntry.keyDirty }"
                                         @input="newEntry.keyDirty = true"
                                         type="text"
                                         v-model="newEntry.key"
                                         placeholder="Key"
                                         title="Key"/>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td class="width-25pct">
                      <p class="control has-icons-left">
                        <input required
                               class="input is-small new-entry-reg"
                               data-qa="new-value-input"
                               type="text"
                               v-model="newEntry.reg"
                               :class="{ 'is-danger': entryMatchingValueInvalid(newEntry) && newEntry.regDirty }"
                               @input="newEntry.regDirty = true"
                               placeholder="Value"
                               title="Value regex"/>
                        <span class="icon is-small is-left has-text-grey">
                              <i class="fas fa-code"></i>
                            </span>
                      </p>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               data-qa="restrict-checkbox"
                               class="new-entry-restrict"
                               v-model="newEntry.restrict"/>
                      </label>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               data-qa="masking-checkbox"
                               class="new-entry-mask"
                               v-model="newEntry.mask"/>
                      </label>
                    </td>
                    <td class="width-30pct">
                      <autocomplete-input
                          :clear-input-after-selection="false"
                          :auto-focus="false"
                          class="new-entry-exclusions"
                          :data-qa="autocompleteTitle"
                          selection-type="multiple"
                          :title="autocompleteTitle"
                          @value-submitted="updateEntryExclusions(newEntry, $event)"/>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <button class="button is-light is-small confirm-add-new-parameter"
                              data-qa="confirm-add-new-parameter-btn"
                              :disabled="!newEntry.key || entryMatchingValueInvalid(newEntry)"
                              :title="addNewParameterTitle"
                              @click="addNewParameter">
                        <span class="icon is-small"><i class="fas fa-plus fa-xs"></i></span>
                      </button>
                    </td>
                  </tr>
                  <tr v-for="(entry, idx) in localDoc[tab].names"
                      class="entry-row"
                      :key="genRowKey(tab, 'names', idx)">
                    <td class="width-30pct">
                      <div class="field">
                        <p class="control has-icons-left">
                          <input required
                                 class="input is-small entry-key"
                                 :class="{ 'is-danger': !entry.key }"
                                 type="text"
                                 @change="emitDocUpdate"
                                 v-model="entry.key"
                                 placeholder="Key"
                                 title="Key name"/>
                          <span class="icon is-small is-left has-text-grey">
                                <i class="fas fa-font"></i>
                              </span>
                        </p>
                      </div>
                    </td>
                    <td class="width-25pct">
                      <p class="control has-icons-left">
                        <input required
                               class="input is-small entry-reg"
                               :class="{ 'is-danger': entryMatchingValueInvalid(entry) }"
                               type="text"
                               @change="emitDocUpdate"
                               v-model="entry.reg"
                               placeholder="Value"
                               title="Value regex"/>
                        <span class="icon is-small is-left has-text-grey">
                              <i class="fas fa-code"></i>
                            </span>
                      </p>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               class="entry-restrict"
                               @change="emitDocUpdate"
                               v-model="entry.restrict"/>
                      </label>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               class="entry-mask"
                               @change="emitDocUpdate"
                               v-model="entry.mask"/>
                      </label>
                    </td>
                    <td class="width-30pct">
                      <autocomplete-input
                          :clear-input-after-selection="false"
                          :initial-value="exclusionsToString(entry.exclusions)"
                          :auto-focus="false"
                          class="entry-exclusions"
                          selection-type="multiple"
                          :title="autocompleteTitle"
                          @value-submitted="updateEntryExclusions(entry, $event)"/>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <button title="Delete entry"
                              data-qa="remove-entry-btn"
                              :data-curie="genRowKey(tab, 'names', idx)"
                              @click="deleteEntryRow(tab, 'names', idx)"
                              class="button is-light is-small remove-entry-button">
                              <span class="icon is-small">
                                <i class="fas fa-trash fa-xs"></i>
                              </span>
                      </button>
                    </td>
                  </tr>
                  <tr v-for="(entry, idx) in localDoc[tab].regex"
                      class="entry-row"
                      :key="genRowKey(tab, 'regex', idx)">
                    <td class="width-30pct">
                      <div class="field">
                        <p class="control has-icons-left">
                          <input required
                                 class="input is-small entry-key"
                                 :class="{ 'is-danger': !entry.key }"
                                 type="text"
                                 @change="emitDocUpdate"
                                 v-model="entry.key"
                                 placeholder="Key"
                                 title="Key regex"/>
                          <span class="icon is-small is-left has-text-grey">
                                <i class="fas fa-code"></i>
                              </span>
                        </p>
                      </div>
                    </td>
                    <td class="width-25pct">
                      <p class="control has-icons-left">
                        <input required
                               class="input is-small entry-reg"
                               :class="{ 'is-danger': entryMatchingValueInvalid(entry) }"
                               type="text"
                               @change="emitDocUpdate"
                               v-model="entry.reg"
                               placeholder="Value"
                               title="Value regex"/>
                        <span class="icon is-small is-left has-text-grey">
                                  <i class="fas fa-code"></i>
                            </span>
                      </p>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               class="entry-restrict"
                               @change="emitDocUpdate"
                               v-model="entry.restrict"/>
                      </label>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <label class="checkbox">
                        <input type="checkbox"
                               class="entry-mask"
                               @change="emitDocUpdate"
                               v-model="entry.mask"/>
                      </label>
                    </td>
                    <td class="width-30pct">
                      <autocomplete-input
                          :clear-input-after-selection="false"
                          :initial-value="exclusionsToString(entry.exclusions)"
                          :auto-focus="false"
                          class="entry-exclusions"
                          selection-type="multiple"
                          :title="autocompleteTitle"
                          @value-submitted="updateEntryExclusions(entry, $event)"/>
                    </td>
                    <td class="has-text-centered width-5pct">
                      <button title="Delete entry"
                              :data-curie="genRowKey(tab, 'regex', idx)"
                              @click="deleteEntryRow(tab, 'regex', idx)"
                              class="button is-light is-small remove-entry-button">
                              <span class="icon is-small">
                                <i class="fas fa-trash fa-xs"></i>
                              </span>
                      </button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {defineComponent} from 'vue'
import {
  ArgsCookiesHeadersType,
  ContentFilterEntryMatch,
  ContentFilterProfile,
  ContentFilterProfileSection,
  ContentFilterProfileSectionType,
  ContentFilterProfileTagLists,
  CustomResponse,
  Dictionary,
  NamesRegexType,
} from '@/types'
import AutocompleteInput, {AutocompleteSuggestion} from '@/components/AutocompleteInput.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import Utils from '@/assets/Utils'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosResponse} from 'axios'
import LabeledTags from '@/components/LabeledTags.vue'

type ContentFilterProfileType = {
  value: keyof ContentFilterProfile['decoding'],
  displayName: 'base64' | 'URL' | 'HTML' | 'Unicode'
}

export default defineComponent({
  name: 'ContentFilterEditor',
  components: {
    LabeledTags,
    AutocompleteInput,
    TagAutocompleteInput,
  },
  props: {
    selectedBranch: String,
    selectedDoc: Object,
    apiPath: String,
  },

  data() {
    const defaultNewEntry: ContentFilterEntryMatch = {
      type: 'names',
      key: '',
      reg: '',
      restrict: false,
      mask: false,
      exclusions: [],
      keyDirty: false,
      regDirty: false,
    }
    const defaultContentFilterProfileSection: ContentFilterProfileSection = {
      names: [] as ContentFilterEntryMatch[],
      regex: [] as ContentFilterEntryMatch[],
      max_count: 0,
      max_length: 0,
    }
    const defaultContentFilterProfileDecoding: ContentFilterProfile['decoding'] = {
      base64: true,
      dual: false,
      html: false,
      unicode: false,
    }
    return {
      sections: ['ignore', 'active', 'report'] as ContentFilterProfileTagLists[],
      addNewColName: null,
      tab: 'args' as ArgsCookiesHeadersType,
      newContentFilterLine: null as ArgsCookiesHeadersType,
      newEntry: defaultNewEntry,
      titles: DatasetsUtils.titles,
      defaultNewEntry: defaultNewEntry,
      defaultContentFilterProfileSection: defaultContentFilterProfileSection,
      defaultContentFilterProfileDecoding: defaultContentFilterProfileDecoding,
      contentFilterSuggestions: [] as AutocompleteSuggestion[],
      autocompleteTitle: 'Space separated content filter rules tags',
      additionalInfoIgnoreAlphanumericInput: 'When checked, arguments, headers or cookies, ' +
          'which contain only alpha numeric characters, will be ignored.',
      additionalInfoContentType: 'When checked, only the selected types will be allowed. ' +
          'Malformed data will get rejected',
      decodingOptions: [
        {
          value: 'base64',
          displayName: 'Base64',
        },
        {
          value: 'dual',
          displayName: 'URL',
        },
        {
          value: 'html',
          displayName: 'HTML',
        },
        {
          value: 'unicode',
          displayName: 'Unicode',
        },
      ] as ContentFilterProfileType[],
      contentTypeOptions: [
        {
          value: 'json',
          displayName: 'JSON',
        },
        {
          value: 'multipart_form',
          displayName: 'Multipart Form',
        },
        {
          value: 'url_encoded',
          displayName: 'URL Encoded',
        },
        {
          value: 'xml',
          displayName: 'XML',
        },
      ],
      customResponseNames: [] as [CustomResponse['id'], CustomResponse['name']][],
      maskingSeedHidden: true,
    }
  },

  computed: {
    localDoc(): ContentFilterProfile {
      return _.cloneDeep(this.selectedDoc) as ContentFilterProfile
    },

    duplicateTags(): Dictionary<string> {
      const doc = this.localDoc
      const allTags = _.concat(doc['active'], doc['report'], doc['ignore'])
      const dupTags = _.filter(allTags, (val, i, iteratee) => _.includes(iteratee, val, i + 1))
      const result = _.fromPairs(_.zip(dupTags, dupTags))
      this.$emit('form-invalid', !!_.size(result))
      return result
    },

    tagsInvalid(): boolean {
      const activeValid = this.localDoc.active?.length > 0
      const reportValid = this.localDoc.report?.length > 0
      const ignoreValid = this.localDoc.ignore?.length > 0
      return !activeValid && !reportValid && !ignoreValid
    },

    addNewParameterTitle(): string {
      if (!this.newEntry.key) {
        return 'Parameter cannot be empty'
      }
      if (this.entryMatchingValueInvalid(this.newEntry)) {
        return 'Matching Value cannot be empty if Mask is unchecked & Ignore Tags is empty'
      }
      return 'Add new parameter'
    },

    maskingSeed: {
      get: function(): string {
        if (this.maskingSeedHidden) {
          return '•••••'
        } else {
          return this.localDoc.masking_seed
        }
      },
      set: function(value: string): void {
        this.localDoc.masking_seed = value
        this.emitDocUpdate()
      },
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
      const idTag = `contentfilterid:${this.localDoc.id?.replace(/ /g, '-') || ''}`
      const nameTag = `contentfiltername:${this.localDoc.name?.replace(/ /g, '-') || ''}`
      return [idTag, nameTag]
    },
  },

  emits: ['update:selectedDoc', 'form-invalid'],

  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },

    openAddNewParameter(tab: ArgsCookiesHeadersType) {
      this.newContentFilterLine = tab
      this.newEntry = {...this.defaultNewEntry}
    },

    cancelNewParameter() {
      this.newContentFilterLine = null
      this.newEntry = {...this.defaultNewEntry}
    },

    addNewParameter() {
      const newEntry = _.cloneDeep(this.newEntry)
      this.newEntry = {...this.defaultNewEntry}
      this.newContentFilterLine = null
      const type: NamesRegexType = newEntry.type
      delete newEntry.type
      delete newEntry.keyDirty
      delete newEntry.regDirty
      this.localDoc[this.tab][type].unshift(newEntry)
      this.emitDocUpdate()
    },

    genRowKey(tab: string, type: string, idx: number) {
      return `${tab}-${type}-${idx}`
    },

    deleteEntryRow(tab: ArgsCookiesHeadersType, type: NamesRegexType, index: number) {
      this.localDoc[tab][type].splice(index, 1)
      this.emitDocUpdate()
    },

    updateEntryExclusions(entry: ContentFilterEntryMatch, exclusions: string) {
      entry.exclusions = exclusions.length > 0 ? _.map(exclusions.split(' '), (tag) => {
        return tag.trim()
      }) : []
      this.emitDocUpdate()
    },

    exclusionsToString(exclusions: ContentFilterEntryMatch['exclusions']) {
      if (exclusions && exclusions.length) {
        return exclusions.join(' ')
      }
      return ''
    },

    normalizeDocSections(section: ContentFilterProfileSectionType) {
      this.localDoc[section] = _.cloneDeep(this.defaultContentFilterProfileSection)
      this.emitDocUpdate()
    },

    normalizeDocDecoding() {
      this.localDoc.decoding = _.cloneDeep(this.defaultContentFilterProfileDecoding)
      this.emitDocUpdate()
    },

    openTagInput(section: ContentFilterProfileTagLists) {
      this.addNewColName = section
    },

    cancelAddNewTag() {
      this.addNewColName = null
    },

    addTag(section: ContentFilterProfileTagLists, entry: string) {
      entry = Utils.removeExtraWhitespaces(entry).trim()
      this.localDoc[section].push(entry)
      this.emitDocUpdate()
    },

    removeTag(section: ContentFilterProfileTagLists, index: number) {
      this.localDoc[section].splice(index, 1)
      this.addNewColName = null
      this.emitDocUpdate()
    },

    tagMessage(tag: string) {
      let message = ''
      if (this.duplicateTags[tag]) {
        message = `[${tag}] is duplicated`
      }
      return message
    },

    getContentTypeStatus(value: string): boolean {
      return this.localDoc.content_type?.includes(value)
    },

    updateContentType(value: string, event: Event): void {
      const state = (event.target as HTMLInputElement).checked
      if (state) {
        this.localDoc.content_type.push(value)
        this.emitDocUpdate()
      } else {
        const index = this.localDoc.content_type.indexOf(value)
        if (index > -1) {
          this.localDoc.content_type.splice(index, 1)
          this.emitDocUpdate()
        }
      }
    },

    entryMatchingValueInvalid(entry: ContentFilterEntryMatch): boolean {
      const matchingValueEmpty = !entry.reg
      if (!matchingValueEmpty) {
        return false
      }
      const maskChecked = entry.mask
      const exclusionTagsIsEmpty = !entry.exclusions.length
      return (!maskChecked && exclusionTagsIsEmpty)
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

  watch: {
    selectedDoc: {
      handler: function(value) {
        // adding necessary fields to all local doc sections if missing
        const sections: ContentFilterProfileSectionType[] = ['args', 'cookies', 'headers', 'path']
        for (let i = 0; i < sections.length; i++) {
          if (!value[sections[i]]) {
            this.normalizeDocSections(sections[i])
          }
        }
        if (!value['decoding']) {
          this.normalizeDocDecoding()
        }
      },
      immediate: true,
      deep: true,
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

.dropdown .dropdown-menu {
  width: auto;
}

.bar {
  margin: 1rem 0 0.5rem;
}

.bar-active {
  @extend .has-background-grey-light;
}

.bar-report {
  @extend .has-background-grey-light;
}

.bar-ignore {
  @extend .has-background-grey-light;
}

:deep(.tag-input) {
  font-size: 0.58rem;
}

.checkbox-input {
  vertical-align: text-bottom;
}

.info-icon {
  margin-left: 0.5rem;
  vertical-align: middle;
}

</style>
