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
                       :to="{path: menuItemKey as string}"
                       :class="{ 'is-active': currentRoutePath.includes(menuItemKey as string) }">
            {{ menuItemDetails.title }}
          </router-link>
          <ul v-if="menuItemDetails.items"
              class="my-0">
            <li v-for="(menuSubItemDetails, menuSubItemKey) in menuItemDetails.items" :key="menuSubItemKey">
              <router-link :data-curie="menuSubItemKey"
                           :to="{path: menuItemKey + menuSubItemKey.toString()}"
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
    const swaggerURL = `${location.protocol}//${location.hostname}:30000/api/v2/`
    const kibanaURL = `${location.protocol}//${location.hostname}:5601/app/discover`
    const grafanaURL = `${location.protocol}//${location.hostname}:30300/`
    const prometheusURL = `${location.protocol}//${location.hostname}:9090/`

    return {
      defaultSwaggerURL: swaggerURL,
      defaultKibanaURL: kibanaURL,
      defaultGrafanaURL: grafanaURL,
      defaultPrometheusURL: prometheusURL,
      menuItems: {
        settings: {
          '/config': {
            title: 'Policies & Rules',
            items: {},
            /* items: {
               '/globalfilters': {title: 'Global Filters'},
               '//flowcontrol': {title: 'Flow Control Policies'},
               '//ratelimits': {title: 'Rate Limits'},
               [`/${branches[0]}/aclprofiles`]: {title: 'ACL Profiles'},
               '//contentfilterprofiles': {title: 'Content Filter Profiles'},
               '//contentfilterrules': {title: 'Content Filter Rules'},
               // '/search': {title: 'Search'},
             },*/
          },
          '/CurieDB': {
            title: 'CurieDB',
          },
          '/publish': {
            title: 'Publish Changes',
          },
          'swagger': {
            title: 'API',
            url: swaggerURL,
            external: true,
          },
        },
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
      return this.$route.path
    },
  },
  methods: {
    async loadLinksFromDB() {
      const systemDBData = (await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/`,
      }))?.data
      const swaggerURL = systemDBData?.links?.swagger_url ? systemDBData.links.swagger_url : this.defaultSwaggerURL
      const kibanaURL = systemDBData?.links?.kibana_url ? systemDBData.links.kibana_url : this.defaultKibanaURL
      const grafanaURL = systemDBData?.links?.grafana_url ? systemDBData.links.grafana_url : this.defaultGrafanaURL
      const prometheusURL =
          systemDBData?.links?.prometheus_url ? systemDBData.links.prometheus_url : this.defaultPrometheusURL
      this.menuItems.settings.swagger = {
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
      let branches
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        branches = response.data
        this.menuItems.settings['/config'].items[`/${branches[0].id}/globalfilters`] = {title: 'Global Filters'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/aclprofiles`] = {title: 'ACL Profiles'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/flowcontrol`] = {title: 'Flow Control Policies'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/ratelimits`] = {title: 'Rate limits'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/contentfilterprofiles`] = {title: 'Content Filter Profiles'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/contentfilterrules`] = {title: 'Content Filter Rules'} as menuItem
        this.menuItems.settings['/config'].items[`/${branches[0].id}/search`] = {title: 'Search'} as menuItem
      } catch (err) {
        console.log('Error while attempting to get branches')
        console.log(err)
      }
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
