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
                         data-qa="cloudfunctions-name-input"
                         type="text"
                         title="Document name"
                         placeholder="Document name"
                         @change="emitDocUpdate"
                         v-model="localDoc.name"/>
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Description
                </label>
                <div class="control">
                  <input class="input is-small document-description"
                         data-qa="cloud-functions-description-input"
                         type="text"
                         title="Cloud functions description"
                         placeholder="Cloud functions description"
                         @change="emitDocUpdate"
                         v-model="localDoc.description">
                </div>
              </div>
              <div class="field">
                <label class="label is-small">
                  Phase
                </label>
                <div class="group-phase mb-3">
                  <select v-model="localDoc.phase"
                                @change="emitDocUpdate"
                                class="phase-map"
                                data-qa="site-name-dropdown"
                                defaultValue="localDoc.phase.name"
                                title="phase">
                          <option v-for="(phase, key) in cloudPhases"
                              :key="key"
                              :value="key">
                            {{ phase }}
                          </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="column is-8">
              <div class="field">
                <label class="label is-small">Code</label>
                <textarea class="is-small textarea is-family-monospace functions-code"
                              data-qa="code-input"
                              title="code"
                              v-model="localDoc.code"
                              @change="emitDocUpdate"
                              rows="20">
                    </textarea>
              </div>
            </div>
          </div>
          <security-policies-connections
              selectedDocType="cloudfunctions"
              :selectedDocId="localDoc.id"
              @go-to-route="emitGoToRoute"
              :selectedBranch="selectedBranch">
          </security-policies-connections>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import _ from 'lodash'
// import DatasetsUtils from '@/assets/DatasetsUtils'
import {defineComponent} from 'vue'
import {
  CloudFunctions,
  CloudFunctionsPhase,
} from '@/types'
import SecurityPoliciesConnections from '@/components/SecurityPoliciesConnections.vue'
import DatasetsUtils from '@/assets/DatasetsUtils'

export type PhaseOption = 'requestpre' | 'requespost' | 'responsepre' | 'responsepost'

export default defineComponent({
  name: 'CloudFunctionsEditor',
  props: {
    selectedDoc: {},
    selectedBranch: String,
    apiPath: String,
    docs: Array,
  },
  components: {
    SecurityPoliciesConnections,
  },
  data() {
    return {
      cloudPhases: DatasetsUtils.cloudPhases as CloudFunctionsPhase,
    }
  },
  computed: {
    localDoc(): CloudFunctions {
      return _.cloneDeep(this.selectedDoc as CloudFunctions)
    },
  },
  emits: ['update:selectedDoc', 'go-to-route'],
  methods: {

    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
    emitGoToRoute(url: string) {
      this.$emit('go-to-route', url)
    },
  },
})
</script>

<style scoped lang='scss'>

.form-label {
  padding-top: 0.25rem;
}

.bar {
  margin: 1rem 0 0.5rem;
}

.seconds-suffix {
  input {
    padding-right: 60px;
  }
}

.remove-threshold-option-button {
  margin-left: auto;
  margin-top: auto;
}

.button-wrapper-column {
  display: flex;
}

.threshold-card {
  padding: 20px;
}

</style>
