<template>
  <section>
    <div class="card">
      <div class="card-content">
        <div class="content">
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
                         data-qa="cloud-functions-name-input"
                         type="text"
                         title="Document name"
                         placeholder="Document name"
                         @change="emitDocUpdate"
                         v-model="localDoc.name"/>
                </div>
              </div>
              <div class="field textarea-field">
                <label class="label is-small">Description</label>
                <div class="control">
                  <textarea class="is-small textarea document-description"
                            title="Document description"
                            @change="emitDocUpdate"
                            v-model="localDoc.description"
                            rows="5"></textarea>
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Phase
                </label>
                <div class="group-phase mb-3">
                  <select v-model="localDoc.phase"
                                @change="emitDocUpdate"
                                class="phase-selection"
                                data-qa="site-name-dropdown"
                                defaultValue="localDoc.phase.name"
                                title="Phase">
                          <option v-for="key in cloudPhases"
                              :key="key"
                              :value="key">
                            {{titles[key]}}
                          </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="column is-8">
              <div class="field">
                <label class="label is-small">Code</label>
                <textarea class="is-small textarea is-family-monospace cloud-functions-code"
                              data-qa="code-input"
                              title="code"
                              v-model="localDoc.code"
                              @change="emitDocUpdate"
                              rows="20">
                    </textarea>
              </div>
            </div>
          </div>
        </div>
        <span class="is-family-monospace has-text-grey-lighter">{{ apiPath }}</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'
import {
  CloudFunction,
  CloudFunctionsPhaseType,
} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'

export type PhaseOption = 'requestpre' | 'requespost' | 'responsepre' | 'responsepost'


export default defineComponent({
  name: 'CloudFunctionsEditor',
  props: {
    selectedDoc: Object as PropType<CloudFunction>,
    selectedBranch: String,
    apiPath: String,
    docs: Array,
  },
  data() {
    return {
      cloudPhases: ['requestpre', 'requestpost', 'responsepre', 'responsepost'] as CloudFunctionsPhaseType[],
      titles: DatasetsUtils.titles,
    }
  },
  computed: {
    localDoc(): CloudFunction {
      return _.cloneDeep(this.selectedDoc as CloudFunction)
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
