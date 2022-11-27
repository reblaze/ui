<template>
  <div class="columns mb-0">
    <div class="column"
         :class="selectedTypeColumnClass">
      <div class="control select is-small is-fullwidth">
        <select :value="localOptionType"
                @change="typeChanged($event)"
                class="option-type-selection"
                title="Type"
                data-qa="countby-dropdown">
          <option v-if="useDefaultSelf"
                  value="self">
            HTTP request
          </option>
          <option v-for="(value, id) in options"
                  :data-qa="`${value}`"
                  :value="id"
                  :key="id">
            {{ value }}
          </option>
        </select>
      </div>
    </div>
    <div class="column"
         :class="selectedNameColumnClass"
         v-if="localOptionType !== 'self'">
      <div v-if="isCategoryArgsCookiesHeaders(localOptionType)"
           class="control is-fullwidth has-icons-left">
        <input type="text"
               title="Name"
               :class="{ 'is-danger': localOption[localOptionType] === '' }"
               v-model="localOption[localOptionType]"
               @change="emitOptionUpdate"
               class="input is-small option-name-input">
        <span class="icon is-small is-left has-text-grey-light"><i class="fa fa-font"></i></span>
      </div>
      <div class="control select is-small is-fullwidth"
           v-if="localOptionType === 'attrs'">
        <div class="select is-fullwidth">
          <select v-model="localOption[localOptionType]"
                  @change="emitOptionUpdate"
                  class="option-attribute-selection"
                  title="Name"
                  data-qa="countby-key-dropdown">
            <option v-for="(value, id) in attributes"
                    :value="id"
                    :key="id"
                    :data-qa="value">{{ value }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="column is-narrow"
         v-if="!!showRemove">
      <button
          :class="removable ? 'has-text-grey' : 'has-text-grey-light is-disabled'"
          :disabled="!removable"
          class="button is-light is-small remove-icon remove-option-button"
          title="Click to remove"
          @click="emitOptionRemove">
          <span class="icon is-small">
            <i class="fas fa-trash fa-xs"></i>
          </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'
import {LimitOptionType} from '@/types'

type LimitRuleType = 'headers' | 'args' | 'cookies' | 'attrs' | 'self'

const limitAttributes = {
  authority: 'Authority',
  company: 'Company',
  country: 'Country',
  ip: 'IP Address',
  method: 'Method',
  network: 'Network',
  path: 'Path',
  securitypolicyentryid: 'Path Matching ID',
  asn: 'Provider',
  query: 'Query',
  region: 'Region',
  securitypolicyid: 'Security Policy ID',
  session: 'Session ID',
  subregion: 'Subregion',
  tags: 'Tag',
  uri: 'URI',
}

export default defineComponent({
  name: 'LimitOption',
  props: {
    option: {
      type: Object as PropType<LimitOptionType>,
      default: (): LimitOptionType => {
        return {
          'attrs': '',
        } as LimitOptionType
      },
    },
    showRemove: {
      type: Boolean,
      default: false,
    },
    removable: {
      type: Boolean,
      default: false,
    },
    useDefaultSelf: {
      type: Boolean,
      default: false,
    },
    ignoreAttributes: {
      type: Array,
      default: () => {
        return [] as string[]
      },
    },
    selectedTypeColumnClass: String,
    selectedNameColumnClass: String,
  },
  data() {
    return {
      options: {
        'headers': 'Header',
        'cookies': 'Cookie',
        'args': 'Argument',
        'attrs': 'Attribute',
      },
    }
  },
  computed: {
    localOption(): LimitOptionType {
      return _.cloneDeep(this.option as LimitOptionType)
    },

    localOptionType(): LimitRuleType {
      return Object.keys(this.localOption)[0] as LimitRuleType
    },

    localOptionName(): string {
      return Object.values(this.localOption)[0]
    },

    attributes() {
      return _.pickBy(limitAttributes, (value, key) => {
        return !this.ignoreAttributes || !this.ignoreAttributes.includes(key)
      })
    },
  },
  emits: ['update:option', 'remove'],
  methods: {
    emitOptionUpdate() {
      this.$emit('update:option', this.localOption)
    },

    emitOptionRemove() {
      this.$emit('remove')
    },

    isCategoryArgsCookiesHeaders(type: LimitRuleType) {
      return (new RegExp('(args|cookies|headers)')).test(type)
    },

    typeChanged(event: Event) {
      const newType: LimitRuleType = (event.target as HTMLSelectElement).value as LimitRuleType
      delete this.localOption[this.localOptionType]
      if (this.isCategoryArgsCookiesHeaders(newType)) {
        this.localOption[newType] = ''
      }
      if (newType === 'attrs') {
        this.localOption[newType] = 'ip'
      }
      if (newType === 'self') {
        this.localOption[newType] = 'self'
      }
      this.emitOptionUpdate()
    },
  },
})
</script>
