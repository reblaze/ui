<template>
  <div class="card-content">
    <div class="content">
      <div class="columns columns-divided">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Name
              <span
                class="has-text-grey is-pulled-right document-id"
                title="Document id"
              >
                {{ localDoc.id }}
              </span>
            </label>
            <div class="control">
              <input
                class="input is-small document-name"
                data-qa="edge-functions-name-input"
                type="text"
                title="Document name"
                placeholder="Document name"
                @change="emitDocUpdate"
                v-model="localDoc.name"
              >
            </div>
          </div>
          <div class="field textarea-field">
            <label class="label is-small">Description</label>
            <div class="control">
              <textarea
                class="is-small textarea document-description"
                title="Document description"
                @change="emitDocUpdate"
                v-model="localDoc.description"
                rows="2"
              />
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Phase
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select
                  v-model="localDoc.phase"
                  @change="emitDocUpdate"
                  class="phase-selection"
                  data-qa="cloud-phase-dropdown"
                  title="Phase"
                >
                  <option
                    v-for="key in cloudPhases"
                    :key="key"
                    :value="key"
                  >
                    {{ titles[key] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-8">
          <div class="field">
            <label class="label is-small">Code</label>
            <textarea
              class="is-small textarea edge-functions-code"
              data-qa="code-input"
              title="code"
              v-model="localDoc.code"
              @change="emitDocUpdate"
              rows="20"
            />
          </div>
        </div>
      </div>
    </div>
    <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ apiPath }}</span>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'
import {EdgeFunction, EdgeFunctionsPhaseType} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'


export default defineComponent({
  name: 'EdgeFunctionsEditor',
  props: {
    selectedDoc: Object as PropType<EdgeFunction>,
    selectedBranch: String,
    apiPath: String,
    docs: Array,
  },
  data() {
    return {
      cloudPhases: ['request', 'response'] as EdgeFunctionsPhaseType[],
      titles: DatasetsUtils.titles,
    }
  },
  computed: {
    localDoc(): EdgeFunction {
      return _.cloneDeep(this.selectedDoc as EdgeFunction)
    },
  },
  emits: ['update:selectedDoc'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
  },
})
</script>
