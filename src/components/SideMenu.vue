<template>
  <div class="side-menu-wrapper">
    <div class="branch-management-wrapper mb-3">
      <div class="control">
        <div class="select is-small is-fullwidth">
          <select :value="selectedBranch"
                  data-qa="switch-branch-dropdown"
                  title="Switch branch"
                  @change="switchBranch($event)"
                  class="branch-selection">
            <option v-for="name in branchNames"
                    :key="name"
                    :value="name">
              {{ name }}
            </option>
          </select>
        </div>
      </div>
      <div class="is-flex">
        <div class="control mr-3">
          <span class="icon is-small is-vcentered">
            <svg :width="24"
                 :height="24"
                 :viewBox="'0 0 24 24'">
              <path :d="mdiSourceBranchPath"/>
            </svg>
          </span>
          <span class="is-size-7 git-branches">
            {{ branchesCounter }} branch<span v-if="branchesCounter !== 1">es</span>
          </span>
        </div>
        <div class="control">
          <span class="icon is-small is-vcentered">
            <svg :width="24"
                 :height="24"
                 :viewBox="'0 0 24 24'">
              <path :d="mdiSourceCommitPath"/>
            </svg>
          </span>
          <span class="is-size-7 git-commits">
            {{ commitsCounter }} commit<span v-if="commitsCounter !== 1">s</span>
          </span>
        </div>
      </div>
    </div>
    <div class="menu-wrapper">
      <sidebar-menu :menu="menu"
                    :relative="true"
                    :hideToggle="true"
                    width="200px"
                    theme="white-theme"/>
    </div>
  </div>
</template>

<script lang="ts">
// import RequestsUtils from '@/assets/RequestsUtils'
import {defineComponent} from 'vue'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import {mdiSourceBranch, mdiSourceCommit} from '@mdi/js'
import _ from 'lodash'
import {Branch} from '@/types'
import Utils from '@/assets/Utils'
import RequestsUtils from '@/assets/RequestsUtils'

export default defineComponent({
  name: 'SideMenu',
  data() {
    const swaggerURL = `${location.protocol}//${location.hostname}:30000/api/v3/`
    const kibanaURL = `${location.protocol}//${location.hostname}:5601/app/discover`
    const grafanaURL = `${location.protocol}//${location.hostname}:30300/`
    const prometheusURL = `${location.protocol}//${location.hostname}:9090/`

    return {
      // Branches / Commits counters
      mdiSourceBranchPath: mdiSourceBranch,
      mdiSourceCommitPath: mdiSourceCommit,
      branches: null as Branch[],

      // Default URLs
      defaultSwaggerURL: swaggerURL,
      defaultKibanaURL: kibanaURL,
      defaultGrafanaURL: grafanaURL,
      defaultPrometheusURL: prometheusURL,

      // Actual URLs
      swaggerURL: swaggerURL,
      kibanaURL: kibanaURL,
      grafanaURL: grafanaURL,
      prometheusURL: prometheusURL,
    }
  },
  watch: {
    branchesCounter: {
      handler: async function() {
        this.branches = await this.branchesStore.list
      },
    },
  },
  computed: {
    branchNames(): string[] {
      return this.branches?.length ? _.sortBy(_.map(this.branches, 'id')) : []
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    branchesCounter(): number {
      return this.branchesStore.branchesCounter
    },

    commitsCounter(): number {
      return this.branchesStore.commitsCounter
    },

    menu(): any[] {
      return [
        // #########
        // Analytics
        // #########
        {
          header: 'Analytics',
        },
        // {
        //   href: '/dashboard',
        //   title: 'Dashboard',
        // },
        {
          href: this.defaultGrafanaURL,
          title: 'Grafana',
          external: true,
        },
        // {
        //   href: '/events-log',
        //   title: 'Events Log',
        // },
        // ########
        // Security
        // ########
        {
          header: 'Security',
        },
        {
          href: `/${this.selectedBranch}/globalfilters`,
          title: 'Global Filters',
        },
        {
          href: `/${this.selectedBranch}/flowcontrol`,
          title: 'Flow Control Policies',
        },
        {
          href: `/${this.selectedBranch}/securitypolicies`,
          title: 'Security Policies',
        },
        {
          href: `/${this.selectedBranch}/ratelimits`,
          title: 'Rate Limit Rules',
        },
        {
          href: `/${this.selectedBranch}/aclprofiles`,
          title: 'ACL Profiles',
        },
        {
          href: `/${this.selectedBranch}/contentfilterprofiles`,
          title: 'Content Filter Profiles',
        },
        {
          href: `/${this.selectedBranch}/contentfilterrules`,
          title: 'Content Filter Rules',
        },
        {
          href: `/${this.selectedBranch}/actions`,
          title: 'Custom Responses',
        },
        // ################
        // Premium Security
        // ################
        {
          header: 'Premium Security',
        },
        {
          href: `/${this.selectedBranch}/dynamic-rules`,
          title: 'Dynamic Rules',
        },
        {
          href: '/quarantined',
          title: 'Quarantined',
        },
        {
          href: `/${this.selectedBranch}/mobile-sdks`,
          title: 'Mobile SDKs',
        },
        // ################
        // Cloud Operations
        // ################
        {
          header: 'Cloud Operations',
        },
        {
          href: `/${this.selectedBranch}/web-proxy`,
          title: 'Web Proxy',
        },
        {
          href: `/${this.selectedBranch}/routing-profiles`,
          title: 'Routing Profiles',
        },
        {
          href: `/${this.selectedBranch}/proxy-templates`,
          title: 'Proxy Templates',
        },
        {
          href: `/${this.selectedBranch}/cloud-functions`,
          title: 'Cloud Functions',
        },
        {
          href: `/${this.selectedBranch}/backend-services`,
          title: 'Backend Services',
        },
        // {
        //   href: `/${this.selectedBranch}/ssl`,
        //   title: 'SSL',
        // },
        // ######
        // System
        // ######
        {
          header: 'System',
        },
        {
          href: `/${this.selectedBranch}/version-control`,
          title: 'Version Control',
        },
        {
          href: '/system-db',
          title: 'System DB',
        },
        {
          href: `/${this.selectedBranch}/publish`,
          title: 'Publish Changes',
        },
        // ####
        // Help
        // ####
        {
          header: 'Help',
        },
        {
          href: '/support',
          title: 'Support',
        },
        {
          href: 'https://docs.curiefense.io/',
          title: 'Curiebook',
          external: true,
        },
        // {
        //   href: 'https://',
        //   title: 'Reblazebook',
        //   external: true,
        // },
        {
          href: this.defaultSwaggerURL,
          title: 'API',
          external: true,
        },
      ]
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    switchBranch(event: Event) {
      const id: Branch['id'] = (event.target as HTMLSelectElement).value
      Utils.toast(`Switched to branch "${id}".`, 'is-info')
      this.branchesStore.setSelectedBranch(id)
      const name = this.$route.name
      this.$router.push({name: name, params: {branch: id}})
    },

    async loadLinksFromDB() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/`,
      })
      const systemDBData = response?.data
      this.swaggerURL = systemDBData?.links?.swagger_url || this.defaultSwaggerURL
      this.kibanaURL = systemDBData?.links?.kibana_url || this.defaultKibanaURL
      this.grafanaURL = systemDBData?.links?.grafana_url || this.defaultGrafanaURL
      this.prometheusURL = systemDBData?.links?.prometheus_url || this.defaultPrometheusURL
    },
  },
  async mounted() {
    this.branches = await this.branchesStore.list
    await this.loadLinksFromDB()
  },
})
</script>
<style lang="scss">
.side-menu-wrapper {
  height: 100%;
  position: fixed;
}

.branch-management-wrapper {
  height: 60px;
}

.menu-wrapper {
  height: calc(100% - 200px);
}

.menu-wrapper .v-sidebar-menu .vsm--scroll-bar {
  left: 2px;
  right: auto;
}

.menu-wrapper .v-sidebar-menu .vsm--header {
  font-size: 0.75rem;
  line-height: 0.75rem;
}

.menu-wrapper .v-sidebar-menu .vsm--item {
  padding-left: 15px;
}

.menu-wrapper .v-sidebar-menu .vsm--link {
  font-size: 0.75rem;
  line-height: 0.5rem;
}
</style>
