<template>
<div>
            <div class="has-text-left has-text-weight-bold pb-3">Connections to Security Policies</div>
            <table class="table connected-security-policies-table">
              <thead>
              <tr>
                <th class="is-size-7 width-150px">Name</th>
                <th class="is-size-7 width-120px">ID</th>
                <th class="is-size-7 ellipsis">Domain Match</th>
                <th class="is-size-7 ellipsis">Entry Match</th>
                <th class="is-size-7 width-80px has-text-centered">
                  <a v-if="!newSecurityPolicyConnectionOpened"
                     class="has-text-grey-dark is-small new-connection-button"
                     data-qa="attach-to-site-btn"
                     title="Add new connection"
                     tabindex="0"
                     @click="openNewSecurityPolicyConnection"
                     @keypress.space.prevent
                     @keypress.space="openNewSecurityPolicyConnection"
                     @keypress.enter="openNewSecurityPolicyConnection">
                    <span class="icon is-small"><i class="fas fa-plus"></i></span>
                  </a>
                  <a v-else
                     class="has-text-grey-dark is-small new-connection-button"
                     data-qa="cancel-attaching-to-site"
                     title="Cancel adding new connection"
                     tabindex="0"
                     @click="closeNewSecurityPolicyConnection"
                     @keypress.space.prevent
                     @keypress.space="closeNewSecurityPolicyConnection"
                     @keypress.enter="closeNewSecurityPolicyConnection">
                    <span class="icon is-small"><i class="fas fa-minus"></i></span>
                  </a>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="newSecurityPolicyConnectionOpened"
                  class="has-background-warning-light new-connection-row">
                <template v-if="newSecurityPolicyConnections.length > 0">
                  <td>
                    <div class="select is-small">
                      <select v-model="newSecurityPolicyConnectionDataMapId"
                              @change="newSecurityPolicyConnectionDataChanged()"
                              class="new-connection-map"
                              data-qa="site-name-dropdown"
                              title="Type">
                        <option v-for="map in newSecurityPolicyConnections" :key="map.id" :value="map.id">
                          {{ map.name }}
                        </option>
                      </select>
                    </div>
                  </td>
                  <td>
                    {{ newSecurityPolicyConnectionData.map.id }}
                  </td>
                  <td>
                    {{ newSecurityPolicyConnectionData.map.match }}
                  </td>
                  <td>
                    <div class="select is-small">
                      <select v-model="newSecurityPolicyConnectionData.entryIndex"
                              class="new-connection-entry-index"
                              data-qa="site-path-dropdown"
                              title="Type">
                        <option v-for="(mapEntry, index) in newSecurityPolicyConnectionEntries"
                                :key="mapEntry.match"
                                :value="index">
                          {{ mapEntry.match }}
                        </option>
                      </select>
                    </div>
                  </td>
                  <td class="has-text-centered">
                    <button title="Add new connection"
                            data-qa="add-new-connection-btn"
                            class="button is-light is-small add-new-connection"
                            @click="addNewSecurityPolicyConnection">
                      <span class="icon is-small"><i class="fas fa-plus fa-xs"></i></span>
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td colspan="5">
                    All Security Policies entries are currently connected to this entity
                  </td>
                </template>
              </tr>
              <tr v-for="(connection, index) in connectedSecurityPoliciesEntries" :key="index">
                <td class="is-size-7 is-vcentered py-3 width-200px connected-entry-row"
                    :title="connection[0]">
                  <a title="Add new"
                     class="security-policy-referral-button"
                     @click="referToSecurityPolicy(connection.id)">
                    {{ connection.name }}
                  </a>
                </td>
                <td class="is-size-7 is-vcentered py-3 width-120px"
                    :title="connection.id">
                  {{ connection.id }}
                </td>
                <td class="is-size-7 is-vcentered py-3 width-300px"
                    :title="connection.domainMatch">
                  {{ connection.domainMatch }}
                </td>
                <td class="is-size-7 is-vcentered py-3 width-300px"
                    :title="connection.entryMatch">
                  {{ connection.entryMatch }}
                </td>
                <td class="is-size-7 is-vcentered width-80px height-50px">
                    <span v-show="currentEntryDeleteIndex !== index">
                    <a tabindex="0"
                       title="Remove connection to the Security Policy"
                       data-qa="remove-attached-site-btn"
                       class="is-small has-text-grey remove-connection-button"
                       @click="setEntryDeleteIndex(index)"
                       @keypress.space.prevent
                       @keypress.space="setEntryDeleteIndex(index)"
                       @keypress.enter="setEntryDeleteIndex(index)">
                      Remove
                    </a>
                    </span>
                    <span v-show="currentEntryDeleteIndex === index">
                        <a class="is-size-7 has-text-grey add-button confirm-remove-connection-button"
                            data-qa="confirm-remove-btn"
                            title="Confirm"
                            tabindex="0"
                            @click="removeSecurityPolicyConnection(connection.id, connection.entryMatch)"
                            @keypress.space.prevent
                            @keypress.space="removeSecurityPolicyConnection(connection.id, connection.entryMatch)"
                            @keypress.enter="removeSecurityPolicyConnection(connection.id, connection.entryMatch)">
                        <i class="fas fa-check"></i> Confirm
                        </a>
                        <br/>
                        <a class="is-size-7 has-text-grey cancel-remove-connection-button"
                            data-qa="cancel-remove-btn"
                            title="Cancel"
                            tabindex="0"
                            @click="setEntryDeleteIndex(-1)"
                            @keypress.space.prevent
                            @keypress.space="setEntryDeleteIndex(-1)"
                            @keypress.enter="setEntryDeleteIndex(-1)">
                            <i class="fas fa-times"></i> Cancel
                        </a>
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
</template>


<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosResponse} from 'axios'
import {
  SecurityPolicy,
  SecurityPolicyEntryMatch,
} from '@/types'


export default defineComponent({
  name: 'SecurityPolicyConnections',
  // securitypolicy securitypolicyentry
  props: {
    selectedDocType: String,
    selectedDocId: String,
    selectedBranch: String,
  },
  data() {
    return {
      securityPolicies: [] as SecurityPolicy[],
      currentEntryDeleteIndex: -1,
      titles: DatasetsUtils.titles,
      newSecurityPolicyConnectionData: {
        map: null,
        entryIndex: 0,
      } as {
        map: SecurityPolicy,
        entryIndex: number,
      },
      newSecurityPolicyConnectionDataMapId: null,
      newSecurityPolicyConnectionOpened: false,
      connectedSecurityPoliciesEntries: [],
    }
  },
  watch: {
    selectedDocId: {
      handler: function() {
        this.getConnectedSecurityPoliciesEntries()
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {

    newSecurityPolicyConnections(): SecurityPolicy[] {
      return this.securityPolicies.filter((securityPolicy) => {
        return !securityPolicy.map.every((securityPolicyEntry) => {
          return securityPolicyEntry['limit_ids'].includes(this.selectedDocId)
        })
      })
    },

    newSecurityPolicyConnectionEntries(): SecurityPolicyEntryMatch[] {
      const securityPolicy = this.newSecurityPolicyConnections.find((securityPolicy) => {
        return securityPolicy.id === this.newSecurityPolicyConnectionData.map.id
      })
      return securityPolicy.map.filter((securityPolicyEntry) => {
        return !securityPolicyEntry['limit_ids'].includes(this.selectedDocId)
      })
    },
  },
  emits: ['update:selectedDoc?', 'go-to-route'],
  methods: {
    referToSecurityPolicy(id: string) {
      this.$emit('go-to-route', `/config/${this.selectedBranch}/securitypolicies/${id}`)
    },

    openNewSecurityPolicyConnection() {
      this.newSecurityPolicyConnectionOpened = true
      this.newSecurityPolicyConnectionData.map =
          this.newSecurityPolicyConnections.length > 0 ? this.newSecurityPolicyConnections[0] : null
      this.newSecurityPolicyConnectionDataMapId = this.newSecurityPolicyConnectionData.map?.id
      this.newSecurityPolicyConnectionData.entryIndex = 0
    },
    closeNewSecurityPolicyConnection() {
      this.newSecurityPolicyConnectionOpened = false
    },
    getConnectedSecurityPoliciesEntries() {
      this.connectedSecurityPoliciesEntries = _.sortBy(_.flatMap(_.filter(this.securityPolicies, (securityPolicy) => {
        return _.some(securityPolicy.map, (mapEntry: SecurityPolicyEntryMatch) => {
          return mapEntry['limit_ids'].includes(this.selectedDocId)
        })
      }), (securityPolicy) => {
        return _.compact(_.map(securityPolicy.map, (mapEntry) => {
          if (mapEntry['limit_ids'].includes(this.selectedDocId)) {
            return {
              name: securityPolicy.name,
              id: securityPolicy.id,
              domainMatch: securityPolicy.match,
              entryMatch: mapEntry.match,
            }
          } else {
            return null
          }
        }))
      }))
    },

    newSecurityPolicyConnectionDataChanged() {
      this.newSecurityPolicyConnectionData.entryIndex = 0
      this.newSecurityPolicyConnectionData.map = this.newSecurityPolicyConnections.find((connection) => {
        return connection.id === this.newSecurityPolicyConnectionDataMapId
      })
    },

    setEntryDeleteIndex(index: number) {
      this.closeNewSecurityPolicyConnection()
      this.currentEntryDeleteIndex = index
    },

    addNewSecurityPolicyConnection() {
      const id = this.newSecurityPolicyConnectionData.map.id
      const entryMatch = this.newSecurityPolicyConnectionEntries[this.newSecurityPolicyConnectionData.entryIndex].match
      const methodName = 'PUT'
      const docType = 'securitypolicies'
      const urlTrail = `configs/${this.selectedBranch}/d/${docType}/e/${id}/`
      const doc = _.find(this.securityPolicies, (securityPolicy) => {
        return securityPolicy.id === id
      })
      const mapEntry = _.find(doc.map, (mapEntry) => {
        return mapEntry.match === entryMatch
      })
      mapEntry['limit_ids'].push(this.selectedDocId)
      this.closeNewSecurityPolicyConnection()
      const docTypeText = this.titles[docType + '-singular']
      const successMessage = `The connection to the ${docTypeText} was added.`
      const failureMessage = `Failed while attempting to add the connection to the ${docTypeText}.`
      RequestsUtils.sendRequest({methodName, url: urlTrail, data: doc, successMessage, failureMessage}).then(() => {
        this.getConnectedSecurityPoliciesEntries()
      })
    },

    removeSecurityPolicyConnection(id: SecurityPolicy['id'], entryMatch: SecurityPolicyEntryMatch['match']) {
      const methodName = 'PUT'
      const docType = 'securitypolicies'
      const urlTrail = `configs/${this.selectedBranch}/d/${docType}/e/${id}/`
      const doc = _.find(this.securityPolicies, (securityPolicy) => {
        return securityPolicy.id === id
      })
      const mapEntry = _.find(doc.map, (mapEntry) => {
        return mapEntry.match === entryMatch
      })
      const docIdIndex = _.findIndex(mapEntry['limit_ids'], (docID) => {
        return docID === this.selectedDocId
      })
      mapEntry['limit_ids'].splice(docIdIndex, 1)
      const docTypeText = this.titles[docType + '-singular']
      const successMessage = `The connection to the ${docTypeText} was removed.`
      const failureMessage = `Failed while attempting to remove the connection to the ${docTypeText}.`
      RequestsUtils.sendRequest({methodName, url: urlTrail, data: doc, successMessage, failureMessage}).then(() => {
        this.setEntryDeleteIndex(-1)
        this.getConnectedSecurityPoliciesEntries()
      })
    },

    loadSecurityPolicies() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
      }).then((response: AxiosResponse<SecurityPolicy[]>) => {
        this.securityPolicies = _.sortBy(response.data)
        console.log('load.securityPolicies', this.securityPolicies)
        this.getConnectedSecurityPoliciesEntries()
        this.newSecurityPolicyConnectionData.map =
            this.newSecurityPolicyConnections.length > 0 ? this.newSecurityPolicyConnections[0] : null
        this.newSecurityPolicyConnectionDataMapId = this.newSecurityPolicyConnectionData.map?.id
      })
    },
  },

  created() {
    this.loadSecurityPolicies()
  },
  mounted() {
    this.getConnectedSecurityPoliciesEntries()
  },
})
</script>
