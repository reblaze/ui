<template>
  <div class="custom-time-picker-component">
    <select class="select-input width-50px"
            v-model="localHours[0]"
            @change="emitUpdateHours">
      <option v-for="hour in hoursArray"
              :key="hour.value"
              :value="hour.value">
        {{ hour.text }}
      </option>
    </select>
    :
    <select class="select-input width-50px"
            v-model="localMinutes[0]"
            @change="emitUpdateMinutes">
      <option v-for="minute in minutesArray"
              :key="minute.value"
              :value="minute.value">
        {{ minute.text }}
      </option>
    </select>
    -
    <select class="select-input width-50px"
            v-model="localHours[1]"
            @change="emitUpdateHours">
      <option v-for="hour in hoursArray"
              :key="hour.value"
              :value="hour.value">
        {{ hour.text }}
      </option>
    </select>
    :
    <select class="select-input width-50px"
            v-model="localMinutes[1]"
            @change="emitUpdateMinutes">
      <option v-for="minute in minutesArray"
              :key="minute.value"
              :value="minute.value">
        {{ minute.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import _ from 'lodash'

type timeStartEnd = [number, number]

export default defineComponent({
  name: 'RbzDatePickerCustomTimePicker',
  props: {
    hours: {
      type: Array,
      default: () => {
        return [0, 0] as timeStartEnd
      },
    },
    minutes: {
      type: Array,
      default: () => {
        return [0, 0] as timeStartEnd
      },
    },
  },
  data() {
    const hoursArray = []
    for (let i = 0; i < 24; i++) {
      hoursArray.push({text: i < 10 ? `0${i}` : i, value: i})
    }
    const minutesArray = []
    for (let i = 0; i < 60; i++) {
      minutesArray.push({text: i < 10 ? `0${i}` : i, value: i})
    }
    return {
      hoursArray,
      minutesArray,
    }
  },
  emits: ['update:hours', 'update:minutes'],
  computed: {
    localHours(): timeStartEnd {
      return _.cloneDeep(this.hours as timeStartEnd)
    },

    localMinutes(): timeStartEnd {
      return _.cloneDeep(this.minutes as timeStartEnd)
    },
  },
  methods: {
    emitUpdateHours() {
      this.$emit('update:hours', this.localHours)
    },

    emitUpdateMinutes() {
      this.$emit('update:minutes', this.localMinutes)
    },
  },
})
</script>

<style scoped
       lang="scss">
.custom-time-picker-component {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.25rem;
}

.select-input {
  border-radius: 4px;
  outline: none;
  padding: 0.25rem;
}
</style>
