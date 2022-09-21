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
                           data-qa="ratelimit-name-input"
                           title="Document name"
                           placeholder="Document name"
                           @change="emitDocUpdate"
                           v-model="localDoc.name"/>
                  </div>
                </div>
              </div>
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Description
                  </label>
                  <div class="control">
                    <input class="input is-small document-description"
                           data-qa="cloud-functions-description-input"
                           type="text"
                           title="Rate limit rule description"
                           placeholder="Rate limit rule description"
                           @change="emitDocUpdate"
                           v-model="localDoc.description">
                  </div>
                </div>
              </div>
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Domains
                  </label>
                  <div class="control">
                    <input class="input is-small document-description"
                           data-qa="cloud-functions-description-input"
                           type="text"
                           title="Rate limit rule description"
                           placeholder="Rate limit rule description"
                           @change="emitDocUpdate"
                           v-model="localDoc.description">
                  </div>
                </div>
              </div>
            </div>
            <div class="columns columns-divided">
              <div class="column is-3">
                <label class="label is-small">
                    Routing
                  </label>
              </div>
              <div class="column is-9">
                <div class="control">
                    <input class="input is-small path"

                    />
                    <input class="input is-small BeService"

                    />
                    <input class="input is-small cloud-functions"

                    />
              </div>
              </div>


            <div class="columns columns-divided">
              <div class="column is-3">
                <label class="label is-small">
                    Services
                  </label>
              </div>
              <div class="column is-9">
                <textarea class="is-small textarea is-family-monospace functions-code"
                                data-qa="services-input"
                                title="services"
                                rows="20">
                </textarea>
              </div>
            </div>
            <div class="columns columns-divided">
              <div class="column is-3">
                <label class="label is-small">
                    Services
                  </label>
              </div>
              <div class="column is-9">
                <div class="field">
                  <label class="label is-small">
                    Mobile SDK:
                  </label>
                  <div class="group-phase mb-3">
                    <select v-model="localDoc.phase"
                                  class="phase-map"
                                  data-qa="site-name-dropdown"
                                  title="phase">
                            <option v-for="phase in optionPhases" :key="phase.id"
                            :value="phase.name" :selected="phase.id === localDoc.phase.id">
                              {{ phase.name }}
                            </option>
                    </select>
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">
                    Proxy template:
                  </label>
                  <div class="group-phase mb-3">
                    <select v-model="localDoc.phase"
                                  class="phase-map"
                                  data-qa="site-name-dropdown"
                                  title="phase">
                            <option v-for="phase in optionPhases" :key="phase.id"
                            :value="phase.name" :selected="phase.id === localDoc.phase.id">
                              {{ phase.name }}
                            </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            </div>

            <security-policies-connections   :selectedDoc="localDoc" :selectedBranch="selectedBranch">
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
} from '@/types'
  // import RequestsUtils from '@/assets/RequestsUtils'
  // import {AxiosResponse} from 'axios'
// import SecurityPoliciesConnections from '@/doc-editors/SecurityPoliciesConnections.vue'

export default defineComponent({
  name: 'CloudFunctionsEditor',
  props: {
    selectedDoc: Object,
    selectedBranch: String,
    apiPath: String,
    docs: Array,
  },
  data() {
    return {
      cloudFunctionsMockData: {
        'id': 'f971e92459e2',
        'name': 'NEW CLOUD FUNCTION',
        'description': '5 requests per minute',
        'phase':
        {
          'id': 'requestpre',
          'name': 'Request Pre Reblaze mock',
        },
        'code': `-- begin custom code
               --custom response header
                ngx.header['foo'] = 'bar'`,
      } as CloudFunctions,
      optionPhases: [{id: 'requestpre', name: 'Request Pre Reblaze'}],
    }
  },
  computed: {
    localDoc(): CloudFunctions { // CloudFunction
      // return _.cloneDeep(this.selectedDoc as CloudFunctions)
      return _.cloneDeep(this.cloudFunctionsMockData as CloudFunctions)
    },
  },
  emits: ['update:selectedDoc', 'go-to-route'],
  methods: {
    emitDocUpdate() {
      this.$emit('update:selectedDoc', this.localDoc)
    },
  },
})
</script>

<style scoped lang="scss">

</style>
