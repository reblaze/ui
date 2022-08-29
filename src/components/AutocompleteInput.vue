<template>

  <div class="dropdown"
       :class="{'is-active': suggestionsVisible}">
    <div class="dropdown-trigger">
      <textarea v-if="inputType === 'textarea'"
                :value="autocompleteTextareaValue"
                :title="title"
                :placeholder="title"
                :data-qa="title"
                class="autocomplete-input textarea is-small"
                @keyup.enter="selectTextareaValue"
                @keyup.space.prevent
                @keyup.down="focusNextSuggestion"
                @keyup.up="focusPreviousSuggestion"
                @keyup.esc="closeDropdown"
                @keyup.delete.prevent="onTextareaDelete"
                @input="onInput"
                @blur="inputBlurred"
                @focus="onTextareaFocus"
                @mousedown.prevent="moveCursorToEnd"
                ref="autocompleteInput" />
      <input v-else
             v-model="autocompleteValue"
             :title="title"
             :placeholder="title"
             :data-qa="title"
             type="text"
             class="autocomplete-input input is-small"
             aria-haspopup="true"
             aria-controls="dropdown-menu"
             @keyup.enter="onEnter"
             @keyup.space="onEnter"
             @keyup.down="focusNextSuggestion"
             @keyup.up="focusPreviousSuggestion"
             @keyup.esc="closeDropdown"
             @input="openDropdown(); valueChanged()"
             @blur="inputBlurred"
             ref="autocompleteInput" />
    </div>
    <div class="dropdown-menu"
         id="dropdown-menu"
         role="menu">
      <div class="dropdown-content">
        <a v-for="(suggestion, index) in matches"
           :class="{'is-active': isSuggestionFocused(index)}"
           @mousedown="suggestionClick(index)"
           :key="index"
           :title="suggestion.value"
           class="dropdown-item ellipsis">
          <span v-if="suggestion.prefix" v-html="suggestion.prefix"></span>
          {{ suggestion.value }}
        </a>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import Utils from '@/assets/Utils'
import {PropType, defineComponent} from 'vue'

export type AutocompleteSuggestion = {
  prefix?: string
  value: string
}

export type AutocompleteInputEvents = 'keyup' | 'keydown' | 'keypress' | 'focus' | 'blur'

export type InputTypes = 'input' | 'textarea'

export default defineComponent({
  name: 'AutocompleteInput',


  props: {
    inputType: {
      type: String,
      default: 'input',
      validator: (val: InputTypes) => ['input', 'textarea'].includes(val),
    },
    initialValue: {
      type: String,
      default: '',
    },
    suggestions: {
      type: Array as PropType<AutocompleteSuggestion[]>,
      default: (): AutocompleteSuggestion[] => [],
    },
    clearInputAfterSelection: Boolean,
    autoFocus: Boolean,
    selectionType: {
      type: String,
      validator: (val: string) => {
        if (!val) {
          return false
        }
        return ['single', 'multiple'].includes(val.toLowerCase())
      },
      default: 'single',
    },
    // Minimum characters length allowed for the value
    minimumValueLength: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: 'Value',
    },
    filterFunction: Function,
  },

  watch: {
    initialValue: {
      handler: function(newVal) {
        if (this.skipNextWatchUpdate) {
          this.skipNextWatchUpdate = false
          return
        }
        const newValFiltered = this.filterFunction ? this.filterFunction(newVal) : newVal
        if (this.autocompleteValue !== newVal) {
          this.autocompleteValue = newValFiltered
          this.closeDropdown()
        }
      },
    },
  },

  data() {
    const {filterFunction, initialValue} = this
    return {
      autocompleteValue: filterFunction ? filterFunction(initialValue) : initialValue,
      open: false,
      focusedSuggestionIndex: -1,
      inputBlurredTimeout: null,
      divider: this.inputType === 'textarea' ? '\n' : ' ',
      skipNextWatchUpdate: false,
    }
  },

  computed: {

    // Filtering the suggestions based on the input
    matches(): AutocompleteSuggestion[] {
      return this.suggestions?.filter((suggestion: AutocompleteSuggestion) => {
        return suggestion.value.toLowerCase().includes(this.currentValue.toLowerCase())
      })
    },

    suggestionsVisible(): boolean {
      return this.currentValue !== '' && this.matches?.length && this.open
    },

    currentValue: {
      get(): string {
        let currentValue
        if (this?.selectionType.toLowerCase() === 'multiple') {
          const values = this.autocompleteValue.split(this.divider)
          currentValue = values[values.length - 1]
        } else {
          currentValue = this.autocompleteValue
        }
        return currentValue.replace('•', '').trim()
      },
      set(currentValue: string) {
        if (this.selectionType.toLowerCase() === 'multiple') {
          const values = this.autocompleteValue.split(this.divider)
          values[values.length - 1] = currentValue
          this.autocompleteValue = values.join(this.divider)
        } else {
          this.autocompleteValue = currentValue
        }
      },
    },

    autocompleteTextareaValue() {
      return this.autocompleteValue.split(this.divider).map(
        (val: string) => {
          val = val.trim()
          return val ? `• ${val.replace('• ', '')}` : val
        },
      ).join(this.divider)
    },
  },

  emits: ['tag-changed', 'value-changed', 'value-submitted', 'keyup', 'keydown', 'keypress', 'focus', 'blur'],

  methods: {

    openDropdown() {
      this.open = true
    },

    valueChanged() {
      this.$emit('value-changed', this.autocompleteValue)
    },

    valueSubmitted() {
      if (this.filterFunction) {
        this.autocompleteValue = this.filterFunction(this.autocompleteValue)
      }
      this.$emit('value-submitted', this.autocompleteValue)
    },

    closeDropdown(): void {
      this.open = false
    },

    suggestionClick(index: number) {
      this.clearInputBlurredTimeout()
      this.focusedSuggestionIndex = index
      this.selectValue(!this.autoFocus)
      if (this.autoFocus) {
        // Putting the focus at the end of the queue so the suggestion focus event would finish beforehand
        setImmediate(() => {
          this.$refs.autocompleteInput.focus()
        })
      }
      if (this.inputType === 'textarea') {
        this.autocompleteValue = `${this.autocompleteValue.trim()}${this.divider}`
      }
      this.skipNextWatchUpdate = true
    },

    moveCursorToEnd(event: Event) {
      const element = event.target as HTMLTextAreaElement
      element.focus()
      element.setSelectionRange(element.value.length, element.value.length)
    },

    selectTextareaValue(event: KeyboardEvent) {
      if (event.key === 'Enter' && this.autocompleteValue.endsWith(this.divider)) {
        event.preventDefault()
      }
      if (!(event.target as HTMLTextAreaElement).value) {
        event.preventDefault()
        return
      }
      this.selectValue()
    },

    onTextareaFocus() {
      if (this.autocompleteValue.trim()) {
        this.autocompleteValue = `${this.autocompleteValue.trim()}${this.divider}`
      }
    },

    onTextareaDelete() {
      const valueArray = this.autocompleteValue.trim().split(this.divider)
      valueArray.splice(-1)
      this.autocompleteValue = valueArray.join(this.divider)
      this.valueSubmitted()
    },

    onInput(event: Event) {
      this.autocompleteValue = (event.target as HTMLTextAreaElement).value
      this.openDropdown()
      this.valueSubmitted()
    },

    onEnter(event: Event) {
      this.selectValue(true)
    },

    selectValue(skipFocus?: boolean) {
      if (this.focusedSuggestionIndex !== -1) {
        this.currentValue = this.matches[this.focusedSuggestionIndex].value
      }
      if (this.currentValue.length < this.minimumValueLength) {
        if (!this.currentValue.length) {
          return
        }
        Utils.toast(
          `Selected value "${this.currentValue}" is invalid!\n` +
          `Values must be at least ${this.minimumValueLength} characters long.`,
          'is-danger',
        )
        this.currentValue = ''
      } else {
        this.valueSubmitted()
        this.valueChanged()
      }
      this.focusedSuggestionIndex = -1
      if (!skipFocus) {
        this.$refs.autocompleteInput.focus()
      }
      this.closeDropdown()
      if (this.clearInputAfterSelection) {
        this.autocompleteValue = ''
        this.skipNextWatchUpdate = true
      }
    },

    focusPreviousSuggestion() {
      if (this.focusedSuggestionIndex > -1) {
        this.focusedSuggestionIndex--
      }
    },

    focusNextSuggestion() {
      if (this.focusedSuggestionIndex < this.matches.length - 1) {
        this.focusedSuggestionIndex++
      }
    },

    isSuggestionFocused(index: number) {
      return index === this.focusedSuggestionIndex
    },

    inputBlurred() {
      // We would like to cancel and skip the selection if one of the following occurred:
      // * The blur is due to a suggestion click
      // * The component is destroyed before we finish selecting
      this.inputBlurredTimeout = setTimeout(() => {
        this.selectValue(true)
      }, 0)
    },

    clearInputBlurredTimeout() {
      clearTimeout(this.inputBlurredTimeout)
    },
  },

  mounted() {
    const events: AutocompleteInputEvents[] = ['keyup', 'keydown', 'keypress', 'focus', 'blur']
    events.map((event: AutocompleteInputEvents) => {
      this.$refs.autocompleteInput.addEventListener(event,
          ($event: Event): void => {
            this.$emit(event, $event)
          })
    })
    if (this.autoFocus) {
      this.$refs.autocompleteInput.focus()
    }
  },

  destroyed() {
    this.clearInputBlurredTimeout()
  },
})
</script>

<style scoped lang="scss">
.dropdown,
.dropdown-trigger,
.dropdown-menu {
  width: 100%;
}
</style>
