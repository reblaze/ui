<template>

  <aside class="menu mt-3">
    <div v-for="(sectionItems, sectionTitle) in menuItems" :key="sectionTitle" class="menu-item">
      <p class="menu-label">
        {{ sectionTitle }}
      </p>
      <ul class="menu-list">
        <li v-for="(menuItemDetails, menuItemKey) in sectionItems" :key="menuItemKey" class="section-item">
          <a v-if="menuItemDetails.external"
             :data-qa="menuItemDetails.title"
             :data-curie="menuItemKey"
             :href="menuItemDetails.url"
             target="_blank">
            {{ menuItemDetails.title }}
          </a>
          <router-link v-else
                       :data-qa="menuItemDetails.title"
                       :data-curie="menuItemKey"
                       :to="menuItemKey.toString()"
                       :class="{ 'is-active': currentRoutePath.includes(menuItemKey.toString()) }">
            {{ menuItemDetails.title }}
          </router-link>
          <ul v-if="menuItemDetails.items"
              class="my-0">
            <li v-for="(menuSubItemDetails, menuSubItemKey) in menuItemDetails.items" :key="menuSubItemKey">
              <router-link :data-curie="menuSubItemKey"
                           :to="menuItemKey + menuSubItemKey.toString()"
                           :class="{ 'is-active': currentRoutePath.includes(menuSubItemKey.toString()) }">
                {{ menuSubItemDetails.title }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>

</template>

<script lang="ts">
import RequestsUtils from '@/assets/RequestsUtils'
import {defineComponent} from 'vue'

type menuItem = {
  title: string
  url?: string
  external?: boolean
  items?: {
    [key: string]: menuItem
  }
}

export default defineComponent({
  name: 'SideMenu',
  data() {
    const swaggerURL = `${location.protocol}//${location.hostname}:30000/api/v3/`
    const kibanaURL = `${location.protocol}//${location.hostname}:5601/app/discover`
    const grafanaURL = `${location.protocol}//${location.hostname}:30300/`
    const prometheusURL = `${location.protocol}//${location.hostname}:9090/`

    return {
      defaultSwaggerURL: swaggerURL,
      defaultKibanaURL: kibanaURL,
      defaultGrafanaURL: grafanaURL,
      defaultPrometheusURL: prometheusURL,
      menuItems: {
        analytics: {
          'kibana': {
            title: 'Kibana',
            url: kibanaURL,
            external: true,
          },
          'grafana': {
            title: 'Grafana',
            url: grafanaURL,
            external: true,
          },
          'prometheus': {
            title: 'Prometheus',
            url: prometheusURL,
            external: true,
          },
        },
        settings: {
          '/list': {
            title: 'Policies & Rules',
            items: {},
          },
          '/CurieDB': {
            title: 'CurieDB',
          },
          '/web-proxy': {
            title: 'Web Proxy',
          },
          '/routing-profiles': {
            title: 'Routing Profiles',
          },
          '/mobile-sdks': {
            title: 'Mobile SDKs',
          },
          '/proxy-templates': {
            title: 'Proxy Templates',
          },
          '/backend-services': {
            title: 'Backend Services',
          },
          '/publish': {
            title: 'Publish Changes',
          },
        },
        git: {
          '/versioncontrol': {
            title: 'Version Control',
          },
        },
        docs: {
          'curiebook': {
            title: 'Curiebook',
            url: 'https://docs.curiefense.io/',
            external: true,
          },
          'swagger': {
            title: 'API',
            url: swaggerURL,
            external: true,
          },
        },
      } as {
        [key: string]: {
          [key: string]: menuItem
        }
      },
    }
  },
  computed: {
    currentRoutePath() {
      return this.$route?.path || ''
    },
  },
  methods: {
    async loadLinksFromDB() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/`,
      })
      const systemDBData = response?.data
      const swaggerURL = systemDBData?.links?.swagger_url || this.defaultSwaggerURL
      const kibanaURL = systemDBData?.links?.kibana_url || this.defaultKibanaURL
      const grafanaURL = systemDBData?.links?.grafana_url || this.defaultGrafanaURL
      const prometheusURL = systemDBData?.links?.prometheus_url || this.defaultPrometheusURL
      this.menuItems.docs.swagger = {
        title: 'API',
        url: swaggerURL,
        external: true,
      }
      this.menuItems.analytics.kibana = {
        title: 'Kibana',
        url: kibanaURL,
        external: true,
      }
      this.menuItems.analytics.grafana = {
        title: 'Grafana',
        url: grafanaURL,
        external: true,
      }
      this.menuItems.analytics.prometheus = {
        title: 'Prometheus',
        url: prometheusURL,
        external: true,
      }
    },

    async loadBranches() {
      const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
      const branchId = response?.data?.[0]?.id || 'undefined'
      const items = this.menuItems.settings['/list'].items // reference
      items[`/${branchId}/globalfilters`] = {title: 'Global Filters'} as menuItem
      items[`/${branchId}/flowcontrol`] = {title: 'Flow Control Policies'} as menuItem
      items[`/${branchId}/securitypolicies`] = {title: 'Security Policies'} as menuItem
      items[`/${branchId}/ratelimits`] = {title: 'Rate Limits'} as menuItem
      items[`/${branchId}/aclprofiles`] = {title: 'ACL Profiles'} as menuItem
      items[`/${branchId}/contentfilterprofiles`] = {title: 'Content Filter Profiles'} as menuItem
      items[`/${branchId}/contentfilterrules`] = {title: 'Content Filter Rules'} as menuItem
      items[`/${branchId}/cloudfunctions`] = {title: 'Cloud Functions'} as menuItem
      items[`/${branchId}/actions`] = {title: 'Custom Responses'} as menuItem
      // items[`/${branchId}/search`] = {title: 'Search'} as menuItem
    },
  },
  async mounted() {
    await this.loadLinksFromDB()
    await this.loadBranches()
  },
})
</script>
<style scoped lang="scss">
.menu-item {
  margin-top: 1.5rem;

  &:first-child {
    margin-top: 0;
  }
}

.menu-label {
  color: #8f99a3;
  font-weight: 700;
  margin-bottom: 0;
}

.menu-list {
  a {
    color: #0f1d38;
    font-size: 14px;
    font-weight: 700;
  }

  a:hover {
    background-color: transparent;
    color: #276cda;
  }

  .is-active {
    background-color: transparent;
    color: #276cda;
    font-weight: 700;
  }
}

</style>
