<template>

  <autocomplete-input
      :suggestions="tagsSuggestions"
      :initial-value="tag"
      :filterFunction="filterTag"
      :clear-input-after-selection="clearInputAfterSelection"
      :auto-focus="autoFocus"
      :selection-type="selectionType"
      :editable="editable"
      :minimum-value-length="minimumTagLength"
      :title="inputTitle"
      :data-qa="inputTitle"
      @value-changed="tagChanged"
      @value-submitted="tagSubmitted"
      @keyup="bubbleEvent('keyup', $event)"
      @keydown="bubbleEvent('keydown', $event)"
      @keypress="bubbleEvent('keypress', $event)"
      @focus="bubbleEvent('focus', $event)"
      @blur="bubbleEvent('blur', $event)"/>

</template>

<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import AutocompleteInput, {AutocompleteInputEvents, AutocompleteSuggestion} from '@/components/AutocompleteInput.vue'
import {defineComponent} from 'vue'
import {AxiosResponse} from 'axios'
import {TagsNamespaceValue} from '@/types'
import Utils from '@/assets/Utils'
import {SelectionType} from '@/components/AutocompleteInput.vue'

export default defineComponent({
  name: 'TagAutocompleteInput',

  components: {
    AutocompleteInput,
  },

  props: {
    initialTag: {
      default: '',
      type: String,
    },
    clearInputAfterSelection: {
      type: Boolean,
      default: false,
    },
    autoFocus: {
      type: Boolean,
      default: false,
    },
    selectionType: {
      type: String,
      validator: (val: SelectionType) => {
        if (!val) {
          return false
        }
        return ['single', 'multiple'].includes(val.toLowerCase())
      },
      default: 'single',
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    const defaultKeyData = {
      legitimate: [] as string[],
      malicious: [] as string[],
      neutral: [] as string[],
    }
    return {
      tag: this.initialTag,
      open: false,
      tagsSuggestions: [] as AutocompleteSuggestion[],
      tagsSuggestionsLoading: false,
      tagsAddedWhileSuggestionsLoading: [] as string[],
      focusedSuggestionIndex: -1,
      db: 'system',
      key: 'tags',
      defaultKeyData: defaultKeyData,
      defaultNamespaceData: {
        tags: defaultKeyData,
      },
      minimumTagLength: 3,
      apiRoot: RequestsUtils.confAPIRoot,
      apiVersion: RequestsUtils.confAPIVersion,
      filterTag(tag: string) {
        return tag.replace(/[^\w: ]|_/g, '-').toLowerCase()
      },
    }
  },

  watch: {
    initialTag: {
      handler: function(newVal) {
        if (newVal !== this.tag) {
          this.tag = newVal
        }
      },
      immediate: true,
    },
  },

  computed: {

    currentTag(): string {
      let currentTag: string
      if (this.selectionType === 'multiple') {
        const tags = this.tag.toString().split(' ')
        currentTag = tags[tags.length - 1].trim() as string
      } else {
        currentTag = this.tag.toString().trim() as string
      }
      return currentTag
    },

    inputTitle(): string {
      return this.selectionType === 'multiple' ? 'Space separated tags' : 'Tag'
    },
  },
  emits: ['tag-changed', 'tag-submitted', 'keyup', 'keydown', 'keypress', 'focus', 'blur'],
  methods: {

    async loadAutocompleteSuggestions() {
      this.tagsSuggestionsLoading = true
      const response: AxiosResponse<TagsNamespaceValue> = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/${this.db}/k/${this.key}/`,
        onFail: async () => {
          // key does not exist, check if db exists
          await RequestsUtils.sendRequest({
            methodName: 'GET',
            url: `db/${this.db}/`,
            onFail: async () => {
              // db doest not exist, key does not exist -> create a db with key
              await RequestsUtils.sendRequest({
                methodName: 'POST',
                url: `db/${this.db}/`,
                data: this.defaultNamespaceData,
              })
              this.tagsSuggestionsLoading = false
            },
          })
          // db exits, key does not exist -> create a key
          await RequestsUtils.sendRequest({
            methodName: 'PUT',
            url: `db/${this.db}/k/${this.key}/`,
            data: this.defaultKeyData,
          })
          this.tagsSuggestionsLoading = false
        },
      })
      this.buildTagsSuggestionsFromData(response?.data || {})
      this.tagsSuggestionsLoading = false
      if (this.tagsAddedWhileSuggestionsLoading.length > 0) {
        this.addUnknownTagsToDB(this.tagsAddedWhileSuggestionsLoading)
        this.tagsAddedWhileSuggestionsLoading = []
      }
    },

    buildTagsSuggestionsFromData(data: TagsNamespaceValue) {
      data = {...this.defaultKeyData, ...data}
      const legitimateTags = data.legitimate.map((item: string) => {
        return {
          prefix: '<span class="dot legitimate" title="legitimate"></span>',
          value: item,
        }
      })
      const maliciousTags = data.malicious.map((item: string) => {
        return {
          prefix: '<span class="dot malicious" title="malicious"></span>',
          value: item,
        }
      })
      const neutralTags = data.neutral.map((item: string) => {
        return {
          prefix: '<span class="dot neutral" title="neutral"></span>',
          value: item,
        }
      })
      this.tagsSuggestions = [].concat(legitimateTags, maliciousTags, neutralTags) as AutocompleteSuggestion[]
      this.tagsSuggestions = _.sortBy(this.tagsSuggestions, 'value') as AutocompleteSuggestion[]
    },

    bubbleEvent(eventName: AutocompleteInputEvents, event: Event) {
      this.$emit(eventName, event)
    },

    tagChanged(newTag: string) {
      this.tag = Utils.removeExtraWhitespaces(newTag).trim()
      this.$emit('tag-changed', this.tag)
    },

    tagSubmitted(newTag: string) {
      this.tag = Utils.removeExtraWhitespaces(newTag).trim()
      // if submitting a tag we don't recognize -> add it to the DB
      if (!this.tagsSuggestions.find((suggestion) => {
        return suggestion.value.toLowerCase() === this.currentTag.toLowerCase()
      })) {
        this.addUnknownTagsToDB([this.currentTag])
      }
      this.$emit('tag-submitted', this.tag)
    },

    async addUnknownTagsToDB(tags: string[]) {
      // do not add tags to DB if DB hasn't loaded
      if (this.tagsSuggestionsLoading) {
        this.tagsAddedWhileSuggestionsLoading.concat(tags)
        return
      }
      // get current tags from DB
      const response = await RequestsUtils.sendRequest({methodName: 'GET', url: `db/${this.db}/k/${this.key}/`})
      const document = {...this.defaultKeyData, ...response?.data}
      // add each new tag to neutral group if does not exist anywhere
      for (let i = 0; i < tags.length; i++) {
        // set both the temporary tag and the tag in array to lowercase for easier logging later
        const tag = tags[i] = tags[i].toLowerCase()
        if ((!document.legitimate || _.findIndex(document.legitimate, (dbTag) => dbTag === tag) === -1) &&
            (!document.malicious || _.findIndex(document.malicious, (dbTag) => dbTag === tag) === -1) &&
            (!document.neutral || _.findIndex(document.neutral, (dbTag) => dbTag === tag) === -1)) {
          document.neutral.push(tag)
        }
      }
      // save to DB
      await RequestsUtils.sendRequest({
        methodName: 'PUT',
        url: `db/${this.db}/k/${this.key}/`,
        data: document,
      })
      // rebuild the tags suggestion list after a successful save
      this.buildTagsSuggestionsFromData(document)
      console.log(
          `saved to namespace the following tags list: [${tags.join(',')}],it will now be available for autocomplete!`,
      )
    },
  },

  created() {
    this.loadAutocompleteSuggestions()
  },
})
</script>
<style scoped lang="scss">

@import 'node_modules/bulma/sass/utilities/initial-variables.sass';
@import 'node_modules/bulma/sass/utilities/functions.sass';
@import 'node_modules/bulma/sass/utilities/derived-variables.sass';
@import 'node_modules/bulma/sass/helpers/color.sass';

:deep(.dot.legitimate) {
  @extend .has-background-success;
}

:deep(.dot.malicious) {
  @extend .has-background-danger;
}

:deep(.dot.neutral) {
  @extend .has-background-grey-light ;
}
</style>
