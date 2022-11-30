<template>
  <Datepicker v-model="date"
              range
              enable-seconds
              auto-apply
              utc="preserve"
              format="yyyy-MM-dd HH:mm"
              input-class-name="input is-small is-size-7 width-260px date-picker-input"
              :close-on-auto-apply="false"
              :month-change-on-scroll="false"
              :clearable="false"
              :time-picker-component="timePicker"
              :preset-ranges="presetRanges"
              @open="loadPresetRanges()">
  </Datepicker>
</template>

<script lang="ts">
import {defineComponent, markRaw} from 'vue'
import RbzDatePickerCustomTimePicker from './RbzDatePickerCustomTimePicker.vue'
import Datepicker from '@vuepic/vue-datepicker'

const MS_PER_MINUTE = 60000
const HOUR = 60 * MS_PER_MINUTE

export default defineComponent({
  name: 'RbzDatePicker',
  components: {
    Datepicker,
  },
  data() {
    return {
      date: this.getDefaultDate(),
      presetRanges: [],
      timePicker: markRaw(RbzDatePickerCustomTimePicker),
    }
  },
  emits: ['update:date'],
  watch: {
    date: {
      handler: function(val, oldVal) {
        if (val && val !== oldVal) {
          this.$emit('update:date', val)
        }
      },
      immediate: true,
    },
  },
  methods: {
    loadPresetRanges() {
      const now = new Date()
      const utcNow = new Date((now.getTimezoneOffset() * MS_PER_MINUTE) + now.getTime())
      this.presetRanges = [
        {
          label: 'Last 30 Minutes',
          range: [new Date(utcNow.getTime() - (HOUR / 2)), utcNow],
        },
        {
          label: 'Last Hour',
          range: [new Date(utcNow.getTime() - HOUR), utcNow],
        },
        {
          label: 'Last 2 Hours',
          range: [new Date(utcNow.getTime() - (2 * HOUR)), utcNow],
        },
        {
          label: 'Last 3 Hours',
          range: [new Date(utcNow.getTime() - (3 * HOUR)), utcNow],
        },
        {
          label: 'Last 4 Hours',
          range: [new Date(utcNow.getTime() - (4 * HOUR)), utcNow],
        },
        {
          label: 'Last 12 Hours',
          range: [new Date(utcNow.getTime() - (12 * HOUR)), utcNow],
        },
        {
          label: 'Last 24 Hours',
          range: [new Date(utcNow.getTime() - (24 * HOUR)), utcNow],
        },
      ]
    },

    getDefaultDate() {
      const now = new Date()
      return [new Date(now.getTime() - (HOUR / 2)), now]
    },

    // Used by parent components
    resetDateToDefault() {
      this.date = this.getDefaultDate()
    },
  },
})
</script>

<style lang="scss">
@import 'node_modules/@vuepic/vue-datepicker/src/VueDatePicker/style/main';

.date-picker-input {
  padding-left: 33px;
}
</style>
