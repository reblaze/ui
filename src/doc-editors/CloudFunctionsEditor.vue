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
                <p class="help is-danger" v-if="isError('name')">
                  {{!localDoc.name?.trim() ? 'A cloud function with this name already exists' :
                  'Please fill in the function name' }}
                </p>
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

export type PhaseOption = 'requestpre' | 'requespost' | 'responsepre' | 'responsepost'
// const cloudFunctionsMockData: CloudFunctions = {
//   'id': 'f971e92459e2',
//   'name': 'NEW CLOUD FUNCTION',
//   'description': '5 requests per minute',
//   'phase': 'requestpre',
//   'code': `-- begin custom code
//   --custom response header
//   ngx.header['foo'] = 'bar'`,
// }

export default defineComponent({
  name: 'CloudFunctionsEditor',
  props: {
    selectedDoc: {},
    selectedBranch: String,
    apiPath: String,
    docs: Array,
  },
  components: {
  //   ResponseAction,
  //   LimitOption,
  //   TagAutocompleteInput,
    SecurityPoliciesConnections,
  },
  data() {
    return {
      worker: {
        id: String,
        name: String,
        description: String,
        phase: String,
        code: String,
        linked_sites: Array,
        match: String,
      },
      workers: [] as CloudFunctions[],
      isDeleteModalVisible: false,
      changes: [],
      isModal: false,

      currentEntryDeleteIndex: -1,

      cloudPhases: {
        'requestpre': 'Request Pre Reblaze',
        'requestpost': 'Request Post Reblaze',
        'responsepre': 'Response Pre Reblaze',
        'responsepost': 'Response Post Reblaze',
      } as CloudFunctionsPhase,

      keysAreValid: true,
    }
  },
  computed: {
    localDoc(): CloudFunctions { // CloudFunction
      return _.cloneDeep(this.selectedDoc as CloudFunctions)
      // return _.cloneDeep(this.cloudFunctionsMockData as CloudFunctions)
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
    // @input="validateName"
    // validateName(name: string) {
    // }

    openModal() {
      this.isDeleteModalVisible = true
      document.addEventListener('keyup', this.escEventListener)
    },
    closeModal() {
      this.isDeleteModalVisible = false
      document.removeEventListener('keyup', this.escEventListener)
    },
    escEventListener(key: any): void {
      if (key === 'Escape') {
        this.closeModal()
      }
    },

    newWorker() {
      return {
        name: 'NEW CLOUD FUNCTION',
        code: '-- begin custom code\n--custom response header\nngx.header["foo"] = "bar"\n',
        phase: 'requestpost',
      }
    },

    // validate() {
    //   const {currentWorker, workers} = this
    //   const isDuplicated = workers.filter(
    //       ({name}) => name.toLowerCase().trim() === currentWorker.toLowerCase().trim()).length > 1
    //   const isValid = !isDuplicated && currentWorker && this.currentWorker.trim()
    //   if (!isValid) {
    //     this.errors.push('name')
    //   }
    //   return isValid
    // },

    checkKeysValidity() {
      const keysToCheck = _.countBy(this.localDoc.id, (item) => {
        if (!item) {
          return ''
        }
        const key = Object.keys(item)[0]
        return `${key}_${item[parseInt(key)]}`
      })
      this.keysAreValid = true
      for (const key of Object.keys(keysToCheck)) {
        if (keysToCheck[key] > 1 || keysToCheck[''] > 0) {
          this.keysAreValid = false
          break
        }
      }
      return this.keysAreValid
    },

    isError(name: string) {
      console.error('error', name)
      return false
    },
  },
  created() {
    console.log('created docs', this.localDoc, 'doc', this.docs)
  },
  mounted() {
    console.log('mounted docs', this.localDoc, 'doc', this.docs, 'apiPath', this.apiPath)
    // this.selectedDoc = cloudFunctionsMockData
  //  this.checkKeysValidity()
  },

  updated() {
    console.log('updated localDoc', this.localDoc)
  },

  // watch: {
  //   selectedDoc: {
  //     handler: function() {
  //       this.getConnectedSecurityPoliciesEntries()
  //     },
  //     immediate: true,
  //     deep: true,
  //   },
  // },
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
