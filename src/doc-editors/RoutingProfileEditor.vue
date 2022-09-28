<template>
    <div class="card">
      <div class="card-content">
        <div class="content">
          <div class="columns columns-divided">
            <div class="column is-3">
            </div>
            <div class="column is-9 custom-panel">
            </div>
          </div>
          <span class="is-family-monospace has-text-grey-lighter">{{ apiPath }}</span>
        </div>
      </div>
    </div>
  </template>
<script lang="ts">
// import _ from 'lodash'
import {defineComponent} from 'vue'
export default defineComponent({
  props: {
    selectedDoc: Object,
    apiPath: String,
  },
  data() {
    return {
    }
  },
  methods: {
  },
})
</script>
<style scoped lang="scss">

</style>
