<template>
  <div class="modal is-active is-large">
    <div class="modal-background">
      <div class="modal-card is-size-7">
        <header class="modal-card-head">
          <h5 class="modal-card-title rbz-header-h5 rbz-header mb-0"
              :title="selectedBalancer.name">
            Select certificate to attach to {{ selectedBalancer.name }}
          </h5>
          <button class="delete"
                  aria-label="close"
                  @click="closeAttachCertPopup"/>
        </header>
        <section class="modal-card-body">
          <div id="attach-modal-content">
            <div class="mb-1 certificate-search">
              <input v-model="certsFilter"
                     type="text"
                     class="input is-small search-input"
                     placeholder="Filter by name">
            </div>
            <div class="table-container table-content">
              <table class="table is-fullwidth table-balancers is-size-7 is-striped">
                <thead>
                <tr>
                  <th class="is-size-7 is-60">
                    Name
                  </th>
                  <th class="is-size-7 is-20">
                    Expiration Date
                  </th>
                  <th class="is-size-7 is-20"/>
                </tr>
                </thead>
                <tbody v-if="filteredCertificatesToAttach.length">
                <tr v-for="(certificate, idx) in filteredCertificatesToAttach"
                    :key="idx">
                  <td class="is-size-7 is-vcentered is-60">
                    {{ certificate.name }}
                  </td>
                  <td class="is-size-7 is-vcentered is-20">
                    {{ certificate.exp_date }}
                  </td>
                  <td class="is-size-7 is-vcentered is-20 has-text-right">
                    <button class="button is-small is-outlined"
                            @click="emitAttachCertificateToLoadBalancer(certificate)"
                            :class="{'is-loading' : certificate.loading}">
                      Attach
                    </button>
                  </td>
                </tr>
                </tbody>
                <tbody v-else>
                <tr>
                  <td colspan="3"
                      class="is-size-7 is-vcentered has-text-centered no-certificate">
                    No certificates found
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right is-fullwidth">
            <button class="button is-small"
                    @click="closeAttachCertPopup">
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Certificate, Link} from '@/types'
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  props: {
    clickedRow: String,
    certificates: Array as PropType<Certificate[]>,
    selectedBalancer: Object,
    isAttachLoading: Boolean,
  },
  emits: ['close-modal', 'attach-certificate-to-load-balancer'],
  data() {
    return {
      certsFilter: '',
    }
  },
  computed: {
    filteredCertificates(): Certificate[] {
      return _.filter(this.certificates, (certificate: Certificate) => {
        return certificate.name.toLowerCase().includes(this.certsFilter.toLowerCase())
      })
    },

    filteredCertificatesToAttach(): Certificate[] {
      if (this.selectedBalancer) {
        let currentLoadBalancerCertificates = this.selectedBalancer.certificates.slice()
        currentLoadBalancerCertificates.push(this.selectedBalancer.default_certificate)
        currentLoadBalancerCertificates = currentLoadBalancerCertificates.join()
        return _.filter(this.filteredCertificates, (certificate: Certificate) => {
          if (this.selectedBalancer.provider === 'gcp') {
            const gcpLinks = _.filter(certificate.links, (link: Link) => {
              return link.provider === 'gcp'
            })
            return !gcpLinks.length || _.some(gcpLinks, (gcpLink: Link) => {
              return !currentLoadBalancerCertificates.includes(gcpLink.link)
            })
          } else if (this.selectedBalancer.provider === 'aws') {
            const awsLinks = _.filter(certificate?.links, (link: Link) => {
              return link.provider === 'aws'
            })
            return !awsLinks.length || _.some(awsLinks, (awsLink: Link) => {
              return !currentLoadBalancerCertificates.includes(awsLink.link)
            })
          }
          return true
        })
      }
      return []
    },
  },
  methods: {
    closeAttachCertPopup() {
      this.$emit('close-modal')
      this.certsFilter = ''
    },

    emitAttachCertificateToLoadBalancer(certificate: Certificate) {
      this.$emit('attach-certificate-to-load-balancer', {
        selectedBalancer: this.selectedBalancer,
        certificate,
      })
    },
  },
})
</script>
<style lang="scss">
.certificate-search {
  position: relative;
  top: -5px;
}

.search-input {
  width: 300px;
}

.no-certificate {
  width: 100%;
}
</style>
