<template>
  <div class="card-content">
    <div class="tabs is-centered">
      <ul>
        <li
          :class=" tab === 'Load balancers' ? 'is-active' : '' "
          class="load-balancers-tab"
          data-qa="load-balancers-tab-btn"
        >
          <a
            tabindex="0"
            @click="tab = 'Load balancers'"
          >
            Load balancers
          </a>
        </li>
        <li
          :class=" tab === 'Certificates' ? 'is-active' : '' "
          class="certificate-tab"
          data-qa="certificate-tab-btn"
        >
          <a
            tabindex="0"
            @click="tab = 'Certificates'"
          >
            Certificate store
          </a>
        </li>
      </ul>
    </div>
    <div
      class="content document-list-wrapper"
      v-show="!loadingDocCounter && selectedBranch"
    >
      <div class="card">
        <div class="card-content">
          <div class="content">
            <div v-show="tab === 'Load balancers'">
              <rbz-table
                :columns="loadBalancerColumnOption"
                :data="loadBalancers"
                :show-menu-column="true"
                :show-filter-button="true"
                :row-clickable="true"
                @row-clicked="onSelectedLoadBalancerRow"
              >
                <template #tableMenu="rowProps">
                  <tr
                    class="is-size-7 selected"
                    v-if="rowProps.row.id === selectedBalancer?.id"
                  >
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
                        <div
                          class="center-details balancer-box default-box-certificate"
                          v-for="cert in selectedBalancer?.certificates"
                          :key="cert"
                        >
                          <div class="column is-10">
                            <p
                              class="has-text-weight-medium"
                              :class="{ 'mb-1': getCertificateDetails(cert)}"
                            >
                              {{ findLocalCertificateNameWithLink(cert) }}
                            </p>
                            <div v-if="getCertificateDetails(cert)">
                              <p class="mb-1">
                                CN: {{ getCertificateDetails(cert).name }}
                              </p>
                              <p class="mb-1">
                                SAN: {{ getCertificateDetails(cert).san }}
                              </p>
                              <p class="mb-1">
                                Expiration: {{ getCertificateDetails(cert).expDate }}
                              </p>
                            </div>
                          </div>
                          <div class="has-text-right">
                            <button
                              @click="setDefaultCertificate(cert)"
                              class="button is-small is-outlined mr-2"
                            >
                              <!-- TODO: add :disabled="!!selectedBalancer.loading"
                                and
                                :class="{ 'is-loading': selectedBalancer.loading === cert }" -->
                              Set default
                            </button>
                            <button
                              @click="detachNonDefaultCertificate(selectedBalancer, cert)"
                              class="button is-small"
                            >
                              <!-- TODO: :class="{ 'is-loading': selectedBalancer.loading === cert }"
                                         :disabled="!!selectedBalancer.loading" -->
                              Detach
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        v-if="isAttachButtonEnabled()"
                        class="button is-outlined is-small"
                        :class="{ 'mt-3': selectedBalancer?.certificates?.length }"
                        @click="openAttachCertPopup(selectedBalancer)"
                      >
                        Attach certificate
                      </button>
                      <span
                        v-else
                        class="has-text-danger pl-4 quota"
                      >
                        You have reached the max certificates quota for {{ selectedBalancer?.provider }} loadbalancer
                      </span>
                    </td>
                  </tr>
                </template>
              </rbz-table>
            </div>
            <div v-show="tab === 'Certificates'">
              <rbz-table
                :columns="certificateColumnOption"
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
                :second-row-button-icon="secondRowButtonIcon"
              />
            </div>
            <span class="is-family-monospace has-text-grey-lighter">
              {{ documentListAPIPath }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
    </div>
    <generate-certificate
      v-if="generateShown"
      @generate-shown-changed="generateShown = false"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"
    />
    <delete-certificate
      v-if="deleteShown"
      @delete-shown-changed="deleteShown = false"
      :clicked-row="clickedRow"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"
    />
    <edit-certificate
      v-if="editShown"
      @edit-shown-changed="editShown = false"
      :clicked-row="clickedRow"
      :balancers="loadBalancers"
      :certificate="certificateByID"
      :certificates="certificates"
      :sites="sites"
      :selected-branch="selectedBranch"
      @call-load-certificate="callLoadCertificate"
    />
    <attach-certificate
      v-if="attachCertPopupShown"
      :selectedBalancer="selectedBalancer"
      :certificates="certificates"
      @attach-shown-changed="attachCertPopupShown = false"
      :attachCertificateToLoadBalancer="attachCertificateToLoadBalancer"/>
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
  emits: ['generate-shown-changed', 'call-load-certificate', 'delete-shown-changed', 'second-rowbutton-clicked'],
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
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      loadBalancers: null as Balancer[],
      certificates: null as Certificate[],
      configs: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
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
      certsSearch: '',
      selectedBalancer: {} as Balancer,

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
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px white-space-pre',
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
          isSortable: true,
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
          /* displayFunction: (item) => {
            return item?.toUpperCase()
          }, */
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

    // This is the specific loadBalancer
    getBalancerByID() {
      const balancer = this.loadBalancers.find((loadBalancer:any) => {
        return loadBalancer.id === this.rowClickedId
      })
      return balancer
    },

    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/ssl/`
    },

    branchNames(): string[] {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    generateUUID(): string {
      let dt = new Date().getTime()
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0
        dt = Math.floor(dt / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
    },

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
      this.selectedBalancer = this.selectedBalancer?.id === this.rowClickedId ? null : this.getBalancerByID
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
      this.isNewLoading = true
      this.editShown = true
      this.isNewLoading = false
    },

    async addNewCertificate() {
      this.isNewLoading = true
      this.generateShown = true
      this.isNewLoading = false
    },

    async deleteProfile(id:string) {
      this.clickedRow = id
      this.isNewLoading = true
      this.deleteShown = true
      this.isNewLoading = false
    },

    async setDefaultCertificate(certLink: string) {
      let cert = this.findLocalCertificateNameWithLink(certLink)
      if (cert.includes('(*)')) {
        cert = certLink
      }
      cert = encodeURIComponent(cert)
      this.attachCertificateToLoadBalancer(this.selectedBalancer, cert, true)
    },

    async attachCertificateToLoadBalancer(balancer:Balancer, certificateId:string, isDefault:boolean = false) {
      console.log('certificateId', certificateId)
      const method = 'PUT'
      const encodedBalancerName = encodeURIComponent(balancer.name)
      const encodedCertificateId = encodeURIComponent(certificateId)
      const encodedBalancerProvider = encodeURIComponent(balancer?.provider)
      const encodedBalancerRegion = encodeURIComponent(balancer?.region)
      const encodedBalancerListenerName = encodeURIComponent(balancer?.listener_name)
      const encodedBalancerListenerPort = encodeURIComponent(balancer?.listener_port)
      const url = `config/${this.selectedBranch}/load-balancers/${encodedBalancerName}/certificates/${encodedCertificateId}/?provider=${encodedBalancerProvider}&default=${isDefault}&region=${encodedBalancerRegion}&listener=${encodedBalancerListenerName}&listener-port=${encodedBalancerListenerPort}`
      await RequestsUtils.sendReblazeRequest({
        methodName: method,
        url: url,
      })
      this.attachCertPopupShown = false
      this.callLoaders()
    },

    async detachNonDefaultCertificate(balancer: Balancer, certificateLink:string) {
      const method = 'DELETE'
      const encodedBalancerName = encodeURIComponent(balancer.name)
      const encodedCertificateLink = encodeURIComponent(certificateLink)
      const encodedBalancerProvider = encodeURIComponent(balancer?.provider)
      const encodedBalancerRegion = encodeURIComponent(balancer?.region)
      const encodedBalancerListenerName = encodeURIComponent(balancer?.listener_name)
      const encodedBalancerListenerPort = encodeURIComponent(balancer?.listener_port)
      const url = `config/${this.selectedBranch}/load-balancers/${encodedBalancerName}/certificates/${encodedCertificateLink}/?provider=${encodedBalancerProvider}&region=${encodedBalancerRegion}&listener=${encodedBalancerListenerName}&listener-port=${encodedBalancerListenerPort}}`
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
      /* this.loadBalancers = [
        {
          'certificates': ['www.cert1.com', 'www.cert2.com', 'www.cert3.com'],
          'default_certificate': 'www.cert2.com',
          'dns_name': '34.102.193.16',
          'listener_name': 'listener-name1',
          'listener_port': '1234',
          'load_balancer_type': 'gcp',
          'name': 'First-loadbalancer',
          'provider': 'gcp',
          'region': 'eu-central-1',
        },
        {
          'certificates': ['www.cert4.com', 'www.cert5.com', 'www.cert6.com'],
          'default_certificate': 'www.cert5.com',
          'dns_name': '255.255.255.255',
          'listener_name': 'listener-name2',
          'listener_port': '4321',
          'load_balancer_type': 'aws',
          'name': 'Second-loadbalancer',
          'provider': 'aws',
          'region': 'eu-central-1',
        },
      ] */
      this.loadBalancers = this.loadBalancers.map((balancer) => {
        return {
          ...balancer,
          loading: false,
          id: `ui-lb-${this.generateUUID()}`,
          isOpen: false,
        }
      })
      this.setLoadingDocStatus(false)
    },

    async loadCertificates() {
      this.setLoadingDocStatus(true)
      const url = `configs/${this.selectedBranch}/d/certificates/`
      const certificatesResponse = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.certificates = certificatesResponse?.data || []
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

    openAttachCertPopup(balancer:Balancer) {
      this.certsSearch = ''
      this.attachCertPopupShown = true
    },

    closeAttachCertPopup() {
      this.attachCertPopupShown = false
      this.certsSearch = ''
      // this.selectedBalancer = ''
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style lang="scss">
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
