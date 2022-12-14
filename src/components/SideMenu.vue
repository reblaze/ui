<template>
  <div class="side-menu-wrapper is-fullheight">
    <div class="branch-management-wrapper">
      <div class="control">
        <div class="select is-small is-fullwidth">
          <select :value="selectedBranch?.id"
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
import {defineComponent} from 'vue'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import {mdiSourceBranch, mdiSourceCommit} from '@mdi/js'
import _ from 'lodash'
import {Branch} from '@/types'
import Utils from '@/assets/Utils'
import RequestsUtils from '@/assets/RequestsUtils'
import packageJson from '../../package.json'
import {useUserStore} from '@/stores/userStore'

export default defineComponent({
  name: 'SideMenu',
  data() {
    const swaggerURL = `${location.protocol}//${location.hostname}:30000/api/v3/`
    // const kibanaURL = `${location.protocol}//${location.hostname}:5601/app/discover`
    const grafanaURL = `${location.protocol}//${location.hostname}:30300/`
    // const prometheusURL = `${location.protocol}//${location.hostname}:9090/`
    const splitVersion = packageJson.version.split('.')
    const docsVersion = `${splitVersion[0]}.${splitVersion[1]}`

    return {
      docsVersion: docsVersion,

      // Branches / Commits counters
      mdiSourceBranchPath: mdiSourceBranch,
      mdiSourceCommitPath: mdiSourceCommit,
      branches: null as Branch[],

      // Default URLs
      defaultSwaggerURL: swaggerURL,
      // defaultKibanaURL: kibanaURL,
      defaultGrafanaURL: grafanaURL,
      // defaultPrometheusURL: prometheusURL,

      // Actual URLs
      swaggerURL: swaggerURL,
      // kibanaURL: kibanaURL,
      grafanaURL: grafanaURL,
      // prometheusURL: prometheusURL,
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

    selectedBranch(): Branch {
      return this.branchesStore.selectedBranch
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
        {
          href: `/${this.selectedBranch?.id}/dashboard`,
          title: 'Dashboard',
        },
        // {
        //   href: this.kibanaURL,
        //   title: 'Kibana',
        //   external: true,
        // },
        {
          href: this.grafanaURL,
          title: 'Grafana',
          external: true,
        },
        // {
        //   href: this.prometheusURL,
        //   title: 'Prometheus',
        //   external: true,
        // },
        {
          href: `/${this.selectedBranch?.id}/events-log`,
          title: 'Events Log',
        },
        // ########
        // Security
        // ########
        {
          header: 'Security',
        },
        {
          href: `/${this.selectedBranch?.id}/globalfilters`,
          title: 'Global Filters',
        },
        {
          href: `/${this.selectedBranch?.id}/flowcontrol`,
          title: 'Flow Control Policies',
        },
        {
          href: `/${this.selectedBranch?.id}/securitypolicies`,
          title: 'Security Policies',
        },
        {
          href: `/${this.selectedBranch?.id}/ratelimits`,
          title: 'Rate Limit Rules',
        },
        {
          href: `/${this.selectedBranch?.id}/aclprofiles`,
          title: 'ACL Profiles',
        },
        {
          href: `/${this.selectedBranch?.id}/contentfilterprofiles`,
          title: 'Content Filter Profiles',
        },
        {
          href: `/${this.selectedBranch?.id}/contentfilterrules`,
          title: 'Content Filter Rules',
        },
        {
          href: `/${this.selectedBranch?.id}/actions`,
          title: 'Custom Responses',
        },
        // ################
        // Premium Security
        // ################
        {
          header: 'Premium Security',
        },
        {
          href: `/${this.selectedBranch?.id}/dynamic-rules`,
          title: 'Dynamic Rules',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/quarantined`,
          title: 'Quarantined',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/mobile-sdks`,
          title: 'Mobile SDK',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        // ##############
        // SaaS Settings
        // ##############
        {
          header: 'SaaS Settings',
        },
        {
          href: `/${this.selectedBranch?.id}/server-groups`,
          title: 'Server Groups',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/backend-services`,
          title: 'Backend Services',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/routing-profiles`,
          title: 'Routing Profiles',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/proxy-templates`,
          title: 'Proxy Templates',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/cloud-functions`,
          title: 'Edge Functions',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/ssl`,
          title: 'SSL',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: `/${this.selectedBranch?.id}/dns-records`,
          title: 'DNS Records',
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        // ######
        // System
        // ######
        {
          header: 'System',
        },
        {
          href: `/${this.selectedBranch?.id}/version-control`,
          title: 'Version Control',
        },
        {
          href: `/${this.selectedBranch?.id}/system-db`,
          title: 'System DB',
        },
        {
          href: `/${this.selectedBranch?.id}/publish`,
          title: 'Publish Changes',
        },
        // ####
        // Help
        // ####
        {
          header: 'Help',
        },
        {
          href: `/${this.selectedBranch?.id}/support`,
          title: 'Support',
        },
        {
          href: 'https://docs.curiefense.io/',
          title: 'Curiebook',
          external: true,
        },
        {
          href: `https://gb.docs.reblaze.com/v/v${this.docsVersion}`,
          title: 'Reblazebook',
          external: true,
          disabled: !this.userStore.checkAccessLevel(this.userStore.accessLevels.reblazeUser),
        },
        {
          href: this.swaggerURL,
          title: 'API',
          external: true,
        },
      ]
    },

    ...mapStores(useBranchesStore, useUserStore),
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
      // this.kibanaURL = systemDBData?.links?.kibana_url || this.defaultKibanaURL
      this.grafanaURL = systemDBData?.links?.grafana_url || this.defaultGrafanaURL
      // this.prometheusURL = systemDBData?.links?.prometheus_url || this.defaultPrometheusURL
    },
  },
  async mounted() {
    this.branches = await this.branchesStore.list
    await this.loadLinksFromDB()
  },
  async updated() {
    this.branches = await this.branchesStore.list
    await this.loadLinksFromDB()
  },
})
</script>
<style lang="scss"
       scoped>
$branch-management-wrapper-height: 60px;
$branch-management-wrapper-margin-bottom: 0.75rem;

.branch-management-wrapper {
  height: $branch-management-wrapper-height;
  margin-bottom: $branch-management-wrapper-margin-bottom;
}

.menu-wrapper {
  height: calc(100% - #{$branch-management-wrapper-height} - #{$branch-management-wrapper-margin-bottom});

  :deep(.v-sidebar-menu) {
    z-index: 1;
  }

  :deep(.v-sidebar-menu .vsm--scroll-bar) {
    left: 2px;
    right: auto;
  }

  :deep(.v-sidebar-menu .vsm--heade) {
    font-size: 0.75rem;
    line-height: 0.75rem;
  }

  :deep(.v-sidebar-menu .vsm--item) {
    padding-left: 15px;
  }

  :deep(.v-sidebar-menu .vsm--link) {
    font-size: 0.75rem;
    line-height: 0.5rem;
  }
}
</style>
