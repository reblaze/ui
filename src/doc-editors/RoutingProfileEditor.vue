<template>
    <div class="card">
      <div class="card-content">
        <div class="content">
          <div class="columns columns-divided">
            <div class="column is-4">
              <div class="field">
                <label class="label is-small">
                  Name
                  <span class="has-text-grey is-pulled-right document-id"
                        title="Rule id">
                          aaa <!-- TODO: {{ localDoc.id }} -->
                      </span>
                </label>
                <div class="control">
                  <input class="input is-small routing-name"
                         title="Document name"
                         placeholder="Routing name"/> 
                         <!-- TODO: add to input: change="emitDocUpdate" v-model="localDoc.name" -->
                </div>
              </div>
              <div class="field">
                <div class="field textarea-field">
                  <label class="label is-small">Description</label>
                  <div class="control">
                        <textarea class="is-small textarea routing-description"
                                  data-qa="routing-input"
                                  title="Routing description"
                                  rows="5">
                                  <!-- TODO: add to textarea: v-model="localDoc.description" @input="emitDocUpdate" -->
                        </textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4 custom-panel">
              <div class="field">
                <label class="label is-small">
                  Cloud function
                </label>
                <div class="control">
                  <input class="input is-small cloud-function-path"
                         title="Routing cloud function"
                         placeholder="Routing cloud function"/> 
                         <!-- TODO: add to input: @change="emitDocUpdate" v-model="localDoc.name" -->
                </div>
              </div>
            </div>
            <div class="column is-4 custom-panel">
              <div class="field">
                <div class="field textarea-field">
                  <label class="label is-small">Description</label>
                  <div class="control">
                        <textarea class="is-small textarea routing-description"
                                  data-qa="routing-input"
                                  title="Routing description"
                                  rows="5">
                                  <!-- TODO: add to textarea: v-model="localDoc.description" @input="emitDocUpdate" -->
                        </textarea>
                  </div>
                </div>
              </div>
              <div class="field">
                <div class="field textarea-field">
                  <label class="label is-small">Description</label>
                  <div class="control">
                        <textarea class="is-small textarea routing-description"
                                  data-qa="routing-input"
                                  title="Routing description"
                                  rows="5">
                                  <!-- TODO: add to textarea: v-model="localDoc.description" @input="emitDocUpdate" -->
                        </textarea>
                  </div>
                </div>
              </div>
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
    apiPath: String,
  },
  data() {
    return {
      selectedType: ['a', 'b', 'c', 'd', 'e', 'f']
    }
  },
  methods: {
  },
})
</script>
<style scoped lang="scss">

</style>
