<template>
  <div class="card-content">
    <div class="tabs is-centered">
      <ul>
        <li :class=" tab === 'Load balancers' ? 'is-active' : '' "
          class="load-balancers-tab"
          data-qa="load-balancers-tab-btn">
          <a tabindex="0"
            @click="tab = 'Load balancers'">
            Load balancers
          </a>
        </li>
        <li :class=" tab === 'Certificates' ? 'is-active' : '' "
          class="certificate-tab"
          data-qa="certificate-tab-btn">
          <a tabindex="0"
            @click="tab = 'Certificates'">
            Certificate store
          </a>
        </li>
      </ul>
    </div>
    <div v-show="!loadingDocCounter && selectedBranch"
      class="content document-list-wrapper">
      <div v-show="tab === 'Load balancers'">
        <rbz-table :columns="loadBalancerColumnOption"
          :data="loadBalancers"
          :show-menu-column="true"
          :show-filter-button="true"
          :row-clickable="true"
          @row-clicked="onSelectedLoadBalancerRow">
          <template #tableMenu="rowProps">
            <tr class="is-size-7 selected"
              v-if="rowProps.row.id === selectedBalancer?.id">
              <td colspan="7">
                <div class="default-box-certificate">
                  <p>
                    <strong>Default certificate:</strong>
                  </p>
                  <div class="column balancer-box">
                    <p :class="{ 'details-box': getCertificateDetails(selectedBalancer?.default_certificate)}">
                      {{ findLocalCertificateNameWithLink(selectedBalancer?.default_certificate) }}
                    </p>
                    <div v-if="getCertificateDetails(selectedBalancer?.default_certificate)">
                      <p class="mb-1">
                        CN: {{ getCertificateDetails(selectedBalancer?.default_certificate).name }}
                      </p>
                      <p class="mb-1">
                        SAN: {{ getCertificateDetails(selectedBalancer?.default_certificate).san }}
                      </p>
                      <p class="mb-1">
                        Expiration: {{ getCertificateDetails(selectedBalancer?.default_certificate)?.expDate }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="selectedBalancer?.certificates?.length">
                  <p class="is-small has-text-small mb-2 default-box-certificate">
                    <strong>Certificates:</strong>
                  </p>
                  <div class="center-details balancer-box default-box-certificate"
                    v-for="(certificate, index) in selectedBalancer?.certificates"
                    :key="index">
                    <div class="column is-10">
                      <p class="has-text-weight-medium"
                        :class="{ 'mb-1': getCertificateDetails(certificate)}">
                        {{ findLocalCertificateNameWithLink(certificate) }}
                      </p>
                      <div v-if="getCertificateDetails(certificate)">
                        <p class="mb-1">
                          CN: {{ getCertificateDetails(certificate).name }}
                        </p>
                        <p class="mb-1">
                          SAN: {{ getCertificateDetails(certificate).san }}
                        </p>
                        <p class="mb-1">
                          Expiration: {{ getCertificateDetails(certificate).expDate }}
                        </p>
                      </div>
                    </div>
                    <div class="has-text-right">
                      <button @click="setDefaultCertificate(selectedBalancer, certificate)"
                        class="button is-small is-outlined mr-2"
                        :class="{ 'is-loading': selectedBalancer.attach_loading === certificate }">
                        Set default
                      </button>
                      <button @click="detachNonDefaultCertificate(selectedBalancer, certificate)"
                        class="button is-small"
                        :class="{ 'is-loading': selectedBalancer?.detach_loading === certificate }">
                        Detach
                      </button>
                    </div>
                  </div>
                </div>
                <button v-if="isAttachButtonEnabled()"
                  class="button is-outlined is-small"
                  :class="{ 'mt-3': selectedBalancer?.certificates?.length }"
                  @click="openAttachCertPopup()">
                  Attach certificate
                </button>
                <span v-else
                  class="has-text-danger pl-4 quota">
                  You have reached the max certificates quota for {{ selectedBalancer?.provider }} loadbalancer
                </span>
              </td>
            </tr>
          </template>
        </rbz-table>
      </div>
      <div v-show="tab === 'Certificates'">
        <rbz-table :columns="certificateColumnOption"
          :data="certificates"
          :show-menu-column="true"
          :show-filter-button="true"
          :show-new-button="true"
          @new-button-clicked="addNewCertificate"
          @row-button-clicked="editProfile"
          @second-row-button-clicked="deleteProfile"
          :show-row-button="true"
          :show-second-row-button="true"
          :second-row-button-title="secondRowButtonTitle"
          :second-row-button-icon="secondRowButtonIcon"/>
      </div>
      <span class="is-family-monospace has-text-grey-lighter">
        {{ documentListAPIPath }}
      </span>
    </div>
    <div class="content no-data-wrapper"
      v-if="loadingDocCounter || !selectedBranch">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
    </div>
    <generate-certificate v-if="generateShown"
      @generate-shown-changed="generateShown = false"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"/>
    <delete-certificate v-if="deleteShown"
      @delete-shown-changed="deleteShown = false"
      :clicked-row="clickedRow"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"/>
    <edit-certificate v-if="editShown"
      @edit-shown-changed="editShown = false"
      :clicked-row="clickedRow"
      :balancers="loadBalancers"
      :certificate="certificateByID"
      :certificates="certificates"
      :sites="sites"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"/>
    <attach-certificate v-if="attachCertPopupShown"
      :selected-balancer="selectedBalancer"
      :certificates="certificates"
      @attach-shown-changed="attachCertPopupShown = false"
      :attach-certificate-to-load-balancer="attachCertificateToLoadBalancer"
      :isAttachLoading="isAttachLoading"/>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {Balancer, Certificate, ColumnOptions, Link, Site} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import GenerateCertificate from '@/doc-editors/popups/GenerateCertificate.vue'
import DeleteCertificate from '@/doc-editors/popups/DeleteCertificate.vue'
import EditCertificate from '@/doc-editors/popups/EditCertificate.vue'
import AttachCertificate from '@/doc-editors/popups/AttachCertificate.vue'
import {useBranchesStore} from '@/stores/BranchesStore'
import {mapStores} from 'pinia'

export default defineComponent({
  name: 'SslList',
  components: {
    RbzTable,
    GenerateCertificate,
    DeleteCertificate,
    EditCertificate,
    AttachCertificate,
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('SSL/list') && val && val !== oldVal) {
          this.populateLoadBalancers()
          this.loadCertificates()
          this.loadSites()
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      MAX_CERT_PER_LB: {
        'gcp': 15,
        'application': 25,
        'classic': 1,
      } as { [key: string]: number },
      rowButtonIcon: 'fa-edit',
      rowButtonTitle: 'Edit',
      secondRowButtonIcon: 'fa-trash',
      secondRowButtonTitle: 'Delete',
      titles: DatasetsUtils.titles,
      loadBalancers: null as Balancer[],
      certificates: null as Certificate[],
      configs: [],
      loadingDocCounter: 0,
      tab: 'Load balancers',
      generateShown: false,
      deleteShown: false,
      editShown: false,
      attachCertPopupShown: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
      clickedRow: null,
      certificateByID: {} as Certificate,
      sites: [] as Site[],
      rowClickedId: '',
      attachCertPopup: {
        shown: false,
      },
      selectedBalancer: {} as Balancer,
      isDetachLoading: false,
      isAttachLoading: false,
    }
  },
  computed: {
    certificateColumnOption() : ColumnOptions[] {
      return [
        {
          title: 'ID',
          fieldNames: ['id'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Expiration Date',
          fieldNames: ['exp_date'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px ellipsis',
        },
        {
          title: 'Linked To',
          displayFunction: (item: Certificate) => {
            if (this.sites?.length > 0) {
              const matchingSite: Site = _.find(this.sites, (site: Site) => {
                return site.ssl_certificate === item.id
              })
              return matchingSite ? matchingSite.server_names.join('\n') : ''
            } else {
              return ''
            }
          },
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
        {
          title: 'AWS',
          fieldNames: ['links'],
          displayFunction: (item) => {
            return item?.links?.provider === 'aws' ? true : false
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
        },
        {
          title: 'GCP',
          fieldNames: ['links'],
          displayFunction: (item) => {
            return item?.links?.provider === 'gcp' ? true : false
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
        },
        {
          title: 'Load Balancers',
          displayFunction: (item:Certificate) => {
            const matchingLoadBalancers = _.filter(this.loadBalancers, (balancer:Balancer) => {
              return _.some(balancer.certificates, (balancerCertificateLink: string) =>{
                return _.some(item.links, (certificateLink: Link) => {
                  return certificateLink.link === balancerCertificateLink
                })
              })
            })
            const matchingLoadBalancersDNS = _.map(matchingLoadBalancers, (balancer:Balancer) => {
              return `${balancer.name}\n(${balancer.dns_name})`
            })
            return matchingLoadBalancersDNS.join('\n')
          },
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis vertical-scroll',
        },
        {
          title: 'SAN',
          fieldNames: ['san'],
          displayFunction: (item) => {
            return item?.san?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
      ]
    },

    loadBalancerColumnOption() : ColumnOptions[] {
      return [
        {
          title: 'Name',
          fieldNames: ['name'],
          displayFunction: (item) => {
            return `${item?.name}:${item?.listener_port}`
          },
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: '# Of certs',
          fieldNames: ['cert'],
          displayFunction: (item) => {
            let defaultCertificateNumber = 0
            if (item?.default_certificate) {
              defaultCertificateNumber = 1
            }
            if (item.provider === 'aws') {
              return `${item?.certificates?.length + defaultCertificateNumber}/25`
            } else if (item.provider === 'gcp') {
              return `${item?.certificates?.length + defaultCertificateNumber}/15`
            }
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Cloud Provider',
          fieldNames: ['provider'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
        },
        {
          title: 'IP/FQDN',
          fieldNames: ['dns_name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
        {
          title: 'Region',
          fieldNames: ['region'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
        },
        {
          title: 'Type',
          fieldNames: ['load_balancer_type'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
        },
      ] as ColumnOptions[]
    },

    selectedLoadBalancerID() {
      const balancer = this.loadBalancers.find((loadBalancer:any) => {
        return loadBalancer.id === this.rowClickedId
      })
      return balancer
    },

    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      if (this.tab === 'Load balancers') {
        return `${apiPrefix}/reblaze/config/load-balancers/`
      } else {
        return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/certificates/`
      }
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    isAttachButtonEnabled() {
      const maxCertsNumber = this.MAX_CERT_PER_LB[this.selectedBalancer?.load_balancer_type]
      return this.certificates?.length + 1 < maxCertsNumber || maxCertsNumber === 1
    },

    getCertificateDetails(certificateLink:string) {
      const linkToCertificatesMapID = this.findLocalCertificateNameWithLink(certificateLink)
      const certificate: Certificate = this.certificates?.find((certificate:Certificate) => {
        return certificate.id === linkToCertificatesMapID
      })
      return certificate?.subject ? {
        san: certificate.san,
        expDate: certificate.exp_date,
        name: (new URLSearchParams(certificate.subject.replaceAll(', ', '&'))).get('CN'),
      } : null
    },

    onSelectedLoadBalancerRow(id: string) {
      this.rowClickedId = id
      this.selectedBalancer = this.selectedBalancer?.id === this.rowClickedId ? null : this.selectedLoadBalancerID
    },

    getCertificateByID(id:string) {
      this.certificateByID = this.certificates?.find((certificate:Certificate) => certificate.id === id)
    },

    async callLoadCertificate() {
      await this.loadCertificates()
    },

    async callLoaders() {
      await this.populateLoadBalancers()
      await this.loadCertificates()
      await this.loadSites()
    },

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    editProfile(id: string) {
      this.clickedRow = id
      this.getCertificateByID(id)
      this.setLoadingDocStatus(true)
      this.editShown = true
      this.setLoadingDocStatus(false)
    },

    async addNewCertificate() {
      this.setLoadingDocStatus(true)
      this.generateShown = true
      this.setLoadingDocStatus(false)
    },

    async deleteProfile(id:string) {
      this.clickedRow = id
      this.setLoadingDocStatus(true)
      this.deleteShown = true
      this.setLoadingDocStatus(false)
    },

    async setDefaultCertificate(balancer:Balancer, certificateLink: string) {
      let cert = this.findLocalCertificateNameWithLink(certificateLink)
      if (cert.includes('(*)')) {
        cert = certificateLink
      }
      cert = encodeURIComponent(cert)
      this.attachCertificateToLoadBalancer(balancer, cert, true, certificateLink)
    },

    async attachCertificateToLoadBalancer(balancer:Balancer, cert:string, isDefault:boolean = false, certificateLink?: string, certificate?: Certificate) {
      balancer.attach_loading = certificateLink
      if (certificate) {
        certificate.loading = true
      }
      const method = 'PUT'
      const encodedBalancerName = encodeURIComponent(balancer.name)
      const encodedCertificateId = encodeURIComponent(cert)
      const encodedBalancerProvider = encodeURIComponent(balancer?.provider)
      const encodedBalancerRegion = encodeURIComponent(balancer?.region)
      const encodedBalancerListenerName = encodeURIComponent(balancer?.listener_name)
      const encodedBalancerListenerPort = encodeURIComponent(balancer?.listener_port)
      const elbVersion = balancer.load_balancer_type === 'classic' ? false : true
      const url = `config/${this.selectedBranch}/load-balancers/${encodedBalancerName}/certificates/${encodedCertificateId}/?provider=${encodedBalancerProvider}&default=${isDefault}&region=${encodedBalancerRegion}&listener=${encodedBalancerListenerName}&listener-port=${encodedBalancerListenerPort}&elbv2=${elbVersion}`
      await RequestsUtils.sendReblazeRequest({
        methodName: method,
        url: url,
      })
      this.attachCertPopupShown = false
      if (certificate) {
        certificate.loading = false
      }
      this.callLoaders()
    },

    async detachNonDefaultCertificate(balancer:Balancer, certificateLink:string) {
      balancer.detach_loading = certificateLink
      const method = 'DELETE'
      const encodedBalancerName = encodeURIComponent(balancer.name)
      const encodedCertificateLink = encodeURIComponent(certificateLink)
      const encodedBalancerProvider = encodeURIComponent(balancer?.provider)
      const encodedBalancerRegion = encodeURIComponent(balancer?.region)
      const encodedBalancerListenerName = encodeURIComponent(balancer?.listener_name)
      const encodedBalancerListenerPort = encodeURIComponent(balancer?.listener_port)
      const elbVersion = balancer.load_balancer_type === 'classic' ? false : true
      const url = `config/${this.selectedBranch}/load-balancers/${encodedBalancerName}/certificates/?certificate-id=${encodedCertificateLink}&provider=${encodedBalancerProvider}&region=${encodedBalancerRegion}&listener=${encodedBalancerListenerName}&listener-port=${encodedBalancerListenerPort}&elbv2=${elbVersion}`
      await RequestsUtils.sendReblazeRequest({
        methodName: method,
        url: url,
      })
      this.callLoaders()
    },

    async populateLoadBalancers() {
      this.setLoadingDocStatus(true)
      const url = `config/load-balancers/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.loadBalancers = response?.data || []
      this.loadBalancers = this.loadBalancers.map((balancer) => {
        return {
          ...balancer,
          attach_loading: false,
          detach_loading: false,
          id: `ui-lb-${DatasetsUtils.generateUUID2()}`,
        }
      })
      this.setLoadingDocStatus(false)
    },

    async loadCertificates() {
      this.setLoadingDocStatus(true)
      const url = `configs/${this.selectedBranch}/d/certificates/`
      const certificatesResponse = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.certificates = certificatesResponse?.data || []
      this.certificates = this.certificates.map((certificate) => {
        return {
          ...certificate,
          loading: false,
        }
      })
      this.setLoadingDocStatus(false)
    },

    async loadSites() {
      const url = `configs/${this.selectedBranch}/d/sites/`
      const sitesResponse = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.sites = sitesResponse?.data || []
    },

    findLocalCertificateNameWithLink(providerLink:string) {
      console.log('providerLink', providerLink)
      const gcpLink:Link = _.find(this.certificateByID.links, (link) => {
        return link.provider === 'gcp'
      })
      if (gcpLink?.link === providerLink) {
        return this.certificateByID.id
      }
      const awsLink:Link = _.find(this.certificateByID.links, (link) => {
        return link.provider === 'aws'
      })
      if (awsLink?.link === providerLink) {
        return this.certificateByID.id
      }
      const defaultCertName = providerLink.split('/')
      return defaultCertName[defaultCertName.length - 1] + '(*)'
    },

    openAttachCertPopup() {
      this.attachCertPopupShown = true
    },

    closeAttachCertPopup() {
      this.attachCertPopupShown = false
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style scoped lang="scss">
  .details-box {
    padding-bottom: 21px;
  }

  .balancer-box {
    background-color: #fff;
    box-shadow: 0 1px 5px -1px rgba(199, 199, 199, 1);
  }

  .balancer-box:hover {
    background-color: rgb(241, 241, 241);
  }

  .default-box-certificate {
    margin-bottom: 12px;
  }

  .center-details {
    align-items: center;
    display: flex;
  }
</style>