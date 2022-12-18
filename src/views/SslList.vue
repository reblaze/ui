<template>
  <div class="card-content">
    <div class="tabs is-centered">
      <ul>
        <li :class="{'is-active' : tab === 'LoadBalancers'}"
            class="load-balancers-tab"
            data-qa="load-balancers-tab-btn">
          <a tabindex="0"
             @click="tab = 'LoadBalancers'">
            Load Balancers
          </a>
        </li>
        <li :class="{'is-active': tab === 'Certificates'}"
            class="certificates-tab"
            data-qa="certificates-tab-btn">
          <a tabindex="0"
             @click="tab = 'Certificates'">
            Certificate Store
          </a>
        </li>
      </ul>
    </div>
    <div v-show="!loadingDocCounter && selectedBranch"
         class="content">
      <div v-show="tab === 'LoadBalancers'">
        <rbz-table :columns="loadBalancerColumnOption"
                   :data="loadBalancers"
                   :show-menu-column="true"
                   :show-filter-button="true"
                   :row-clickable="true"
                   @row-clicked="onSelectedLoadBalancerRow">
          <template #tableMenu="rowProps">
            <tr class="is-size-7 selected"
                v-if="selectedBalancer?.id && selectedBalancer.id === rowProps.row.id">
              <td colspan="7">
                <div class="mb-3 default-certificate">
                  <p>
                    <strong>Default certificate:</strong>
                  </p>
                  <div class="column balancer-box">
                    <p class="has-text-weight-medium"
                       :class="{ 'mb-1': getCertificateDetails(selectedBalancer?.default_certificate)}">
                      {{ findLocalCertificateNameWithLink(selectedBalancer?.default_certificate) }}
                    </p>
                    <div v-if="getCertificateDetails(selectedBalancer?.default_certificate)">
                      <p class="mb-1">
                        Certificate Name: {{ getCertificateDetails(selectedBalancer?.default_certificate).name }}
                      </p>
                      <p class="mb-1">
                        CN: {{ getCertificateDetails(selectedBalancer?.default_certificate).cn }}
                      </p>
                      <p class="mb-1">
                        SAN: {{ getCertificateDetails(selectedBalancer?.default_certificate).san.join(', ') }}
                      </p>
                      <p class="mb-1">
                        Expiration: {{ getCertificateDetails(selectedBalancer?.default_certificate)?.expDate }}
                      </p>
                    </div>
                  </div>
                </div>
                <div v-if="selectedBalancer?.certificates?.length"
                     class="attached-certificates">
                  <p class="is-small has-text-small mb-2 mb-3">
                    <strong>Certificates:</strong>
                  </p>
                  <div class="center-details is-flex balancer-box mb-3 attached-certificate"
                       v-for="(certificate, index) in selectedBalancer?.certificates"
                       :key="index">
                    <div class="column is-10">
                      <p class="has-text-weight-medium"
                         :class="{ 'mb-1': getCertificateDetails(certificate)}">
                        {{ findLocalCertificateNameWithLink(certificate) }}
                      </p>
                      <div v-if="getCertificateDetails(certificate)">
                        <p class="mb-1">
                          Certificate Name: {{ getCertificateDetails(certificate).name }}
                        </p>
                        <p class="mb-1">
                          CN: {{ getCertificateDetails(certificate).cn }}
                        </p>
                        <p class="mb-1">
                          SAN: {{ getCertificateDetails(certificate).san.join(', ') }}
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
                <button v-if="isAttachButtonEnabled"
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
                   @second-row-button-clicked="openDeleteCertificateModal"
                   :show-row-button="true"
                   :show-second-row-button="true"
                   :second-row-button-title="secondRowButtonTitle"
                   :second-row-button-icon="secondRowButtonIcon"
                   :second-row-button-disabled-callback="isDeleteDisabled"
                   override-menu-column-width-class="width-70px"/>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
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
                          @close-modal="generateShown = false"
                          :selected-branch="selectedBranch"
                          @call-load-certificate="loadCertificates"/>
    <delete-certificate v-if="deleteShown"
                        @close-modal="deleteShown = false"
                        :certificate="certificateByID"
                        :attachedApps="attachedApps"
                        :selected-branch="selectedBranch"
                        @call-load-certificate="loadCertificates"/>
    <edit-certificate v-if="editShown"
                      @close-modal="editShown = false"
                      :balancers="loadBalancers"
                      :certificate="certificateByID"
                      :certificates="certificates"
                      :sites="sites"
                      :selected-branch="selectedBranch"
                      @call-loaders="callLoaders"/>
    <attach-certificate v-if="attachCertPopupShown"
                        :selected-balancer="selectedBalancer"
                        :certificates="certificates"
                        @close-modal="attachCertPopupShown = false"
                        @attach-certificate-to-load-balancer="attachCertificateToLoadBalancer(
                          $event.selectedBalancer,
                          $event.certificate.id,
                          false,
                          '',
                          $event.certificate
                        )"
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
          this.setLoadingDocStatus(true)
          this.callLoaders()
          this.setLoadingDocStatus(false)
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
      loadingDocCounter: 0,
      tab: 'LoadBalancers' as 'LoadBalancers' | 'Certificates',
      generateShown: false,
      deleteShown: false,
      editShown: false,
      attachCertPopupShown: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
      clickedRow: null,
      certificateByID: {} as Certificate,
      sites: [] as Site[],
      selectedBalancer: {} as Balancer,
      isDetachLoading: false,
      isAttachLoading: false,
      attachedApps: [] as string[],
    }
  },
  computed: {
    certificateColumnOption(): ColumnOptions[] {
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
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Expiration Date',
          fieldNames: ['exp_date'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
          cellContentClasses: 'ellipsis',
          cellContentConditionalClasses: (item: Certificate) => {
            const sslDateUnix = Number(new Date(`${item['exp_date']}T00:00:00.000Z`))
            const currentDateUnix = Number(new Date())
            const ONE_MONTH = 1000 * 60 * 60 * 24 * 30
            return (sslDateUnix - currentDateUnix) < ONE_MONTH ? 'has-text-danger' : ''
          },
        },
        {
          title: 'Linked To',
          displayFunction: (item: Certificate) => {
            if (this.sites?.length > 0) {
              const matchingSites: Site[] = _.filter(this.sites, (site: Site) => {
                return site.ssl_certificate === item.id
              })
              return matchingSites.length ? _.map(matchingSites, 'name').join('\n') : ''
            } else {
              return ''
            }
          },
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'ellipsis white-space-pre vertical-scroll multi-line',
        },
        {
          title: 'AWS',
          fieldNames: ['links'],
          displayFunction: (item: Certificate) => {
            const isAWS = _.some(item?.links, (link: Link) => {
              return link?.provider === 'aws'
            })
            return isAWS ? 'true' : 'false'
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre',
        },
        {
          title: 'GCP',
          fieldNames: ['links'],
          displayFunction: (item: Certificate) => {
            const isGCP = _.some(item?.links, (link: Link) => {
              return link?.provider === 'gcp'
            })
            return isGCP ? 'true' : 'false'
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre',

        },
        {
          title: 'Load Balancers',
          displayFunction: (item: Certificate) => {
            const matchingLoadBalancers = _.filter(this.loadBalancers, (balancer: Balancer) => {
              return _.some(balancer.certificates, (balancerCertificateLink: string) => {
                return _.some(item.links, (certificateLink: Link) => {
                  return certificateLink.link === balancerCertificateLink
                })
              })
            })
            const matchingDefaultCertificate = _.filter(this.loadBalancers, (balancer: Balancer) => {
              return _.some(item.links, (certificateLink: Link) => {
                return certificateLink.link === balancer.default_certificate
              })
            })
            const unionMatchingLoadBalancersAndDefault = _.union(matchingLoadBalancers, matchingDefaultCertificate)
            const matchingLoadBalancersDNS = _.map(unionMatchingLoadBalancersAndDefault, (balancer: Balancer) => {
              return `${balancer.name}\n(${balancer.dns_name})`
            })
            return matchingLoadBalancersDNS.join('\n')
          },
          isSearchable: true,
          classes: 'width-120px',
          cellContentClasses: 'white-space-pre ellipsis vertical-scroll multi-line',
        },
        {
          title: 'SAN',
          fieldNames: ['san'],
          displayFunction: (item) => {
            return item?.san?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre ellipsis',
        },
      ]
    },

    loadBalancerColumnOption(): ColumnOptions[] {
      return [
        {
          title: 'Name',
          fieldNames: ['name'],
          displayFunction: (item) => {
            return `${item?.name}:${item?.listener_port}`
          },
          isSortable: true,
          isSearchable: true,
          cellContentClasses: 'ellipsis load-balancer-name',

        },
        {
          title: '# Of Certs',
          fieldNames: ['cert'],
          displayFunction: (item) => {
            let defaultCertificateNumber = 0
            if (item.default_certificate) {
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
          classes: 'width-120px',
          cellContentClasses: 'white-space-pre',

        },
        {
          title: 'IP/FQDN',
          fieldNames: ['dns_name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre ellipsis',
        },
        {
          title: 'Region',
          fieldNames: ['region'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre',
        },
        {
          title: 'Type',
          fieldNames: ['load_balancer_type'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'white-space-pre',
        },
      ] as ColumnOptions[]
    },

    selectedLoadBalancerID() {
      return this.loadBalancers.find((loadBalancer: any) => {
        return loadBalancer.id === this.clickedRow
      })
    },

    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      if (this.tab === 'LoadBalancers') {
        return `${apiPrefix}/reblaze/config/load-balancers/`
      } else {
        return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/certificates/`
      }
    },

    isAttachButtonEnabled() {
      const maxCertsNumber = this.MAX_CERT_PER_LB[this.selectedBalancer?.load_balancer_type]
      return this.selectedBalancer.certificates?.length + 1 < maxCertsNumber || maxCertsNumber === 1
    },

    sitesByCertNameMap() {
      const returnValue: { [key: string]: string[] } = {}
      this.sites?.forEach((site: Site) => {
        const certId = site.ssl_certificate
        if (certId) {
          if (!returnValue[certId]) {
            returnValue[certId] = []
          }
          returnValue[certId].push(site.name)
        }
      })
      return returnValue
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    getCertificateDetails(certificateLink: string) {
      const linkToCertificatesMapID = this.findLocalCertificateNameWithLink(certificateLink)
      const certificate: Certificate = this.certificates?.find((certificate: Certificate) => {
        return certificate.id === linkToCertificatesMapID
      })
      return certificate?.subject ? {
        san: certificate.san,
        expDate: certificate.exp_date,
        cn: (new URLSearchParams(certificate.subject.replaceAll(', ', '&'))).get('CN'),
        name: certificate.name,
      } : null
    },

    onSelectedLoadBalancerRow(id: string) {
      this.clickedRow = id
      this.selectedBalancer = this.selectedBalancer?.id === this.clickedRow ? null : this.selectedLoadBalancerID
    },

    getCertificateByID(id: string) {
      this.certificateByID = this.certificates?.find((certificate: Certificate) => certificate.id === id)
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

    openDeleteCertificateModal(certificateId:string) {
      this.attachedApps = this.sitesByCertNameMap[certificateId]
      this.clickedRow = certificateId
      this.setLoadingDocStatus(true)
      this.getCertificateByID(certificateId)
      this.deleteShown = true
      this.setLoadingDocStatus(false)
    },

    isDeleteDisabled(certificate: Certificate) {
      return _.some(this.loadBalancers, (balancer: Balancer) => {
        const balancerCertificate = _.some(balancer.certificates, (balancerCertificateLink: string) => {
          return _.some(certificate.links, (certificateLink: Link) => {
            return certificateLink.link === balancerCertificateLink
          })
        })
        const balancerDefaultCertificate = _.some(certificate.links, (certificateLink: Link) => {
          return certificateLink.link === balancer.default_certificate
        })
        return balancerCertificate || balancerDefaultCertificate || certificate.id === 'placeholder'
      })
    },

    async setDefaultCertificate(balancer: Balancer, certificateLink: string) {
      let cert = this.findLocalCertificateNameWithLink(certificateLink)
      if (cert.includes('(*)')) {
        cert = certificateLink
      }
      this.attachCertificateToLoadBalancer(balancer, cert, true, certificateLink)
    },

    async attachCertificateToLoadBalancer(balancer: Balancer,
                                          cert: string,
                                          isDefault: boolean = false,
                                          certificateLink?: string,
                                          certificate?: Certificate) {
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
      const elbVersion = balancer.load_balancer_type !== 'classic'
      // eslint-disable-next-line
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

    async detachNonDefaultCertificate(balancer: Balancer, certificateLink: string) {
      balancer.detach_loading = certificateLink
      const method = 'DELETE'
      const encodedBalancerName = encodeURIComponent(balancer.name)
      const encodedCertificateLink = encodeURIComponent(certificateLink)
      const encodedBalancerProvider = encodeURIComponent(balancer?.provider)
      const encodedBalancerRegion = encodeURIComponent(balancer?.region)
      const encodedBalancerListenerName = encodeURIComponent(balancer?.listener_name)
      const encodedBalancerListenerPort = encodeURIComponent(balancer?.listener_port)
      const elbVersion = balancer.load_balancer_type !== 'classic'
      // eslint-disable-next-line max-len
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
      this.setLoadingDocStatus(true)
      const url = `configs/${this.selectedBranch}/d/sites/`
      const sitesResponse = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.sites = sitesResponse?.data || []
      this.setLoadingDocStatus(false)
    },

    findLocalCertificateNameWithLink(providerLink: string) {
      const certificate = _.find(this.certificates, (certificate: Certificate) => {
        const gcpLink: Link = _.find(certificate.links, (link) => {
          return link.provider === 'gcp'
        })
        if (gcpLink?.link === providerLink) {
          return true
        }
        const awsLink: Link = _.find(certificate.links, (link) => {
          return link.provider === 'aws'
        })
        if (awsLink?.link === providerLink) {
          return true
        }
        return false
      })
      if (certificate) {
        return certificate.id
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
<style scoped
       lang="scss">
@import 'src/assets/styles/colors';

.balancer-box {
  background-color: $color-white;
  box-shadow: 0 1px 5px -1px rgba(199, 199, 199, 1);
}

.balancer-box:hover {
  background-color: $color-black-haze;
}

.center-details {
  align-items: center;
}

:deep(.rbz-table .multi-line) {
  height: fit-content;
  max-height: 10rem;
}
</style>
