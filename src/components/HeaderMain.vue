<template>
  <div class="container is-fluid">
    <div class="navbar-brand">
      <a class="navbar-item"
         href="/">
        <img :src="require('@/assets/logo.png')"
             class="logo"
             alt="logo">
      </a>
    </div>
    <div class="page-title height-60px is-size-4">
      {{ pageTitle }}
    </div>
    <div class="width-120px version-box is-size-7 has-text-grey">
      <div class="ui-version">
        <span class="width-80px is-inline-block">
          UI version:
        </span>
        <span>
          {{ clientVersion || '0.0.0' }}
        </span>
      </div>
      <div class="api-version">
        <span class="width-80px is-inline-block">
          API version:
        </span>
        <span>
          {{ apiVersion || '0.0.0' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import packageJson from '@/../package.json'
import {defineComponent} from 'vue'
import RequestsUtils from '@/assets/RequestsUtils'
import DatasetsUtils from '@/assets/DatasetsUtils'

export default defineComponent({
  name: 'HeaderMain',
  data() {
    return {
      clientVersion: packageJson.version,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  computed: {
    pageTitle(): string {
      let title = this.$route?.meta?.title || ''
      title = title.replace(':docType:', DatasetsUtils.titles[this.$route?.params?.doc_type])
      return title
    },
  },
})
</script>

<style scoped
       lang="scss">
.container {
  display: flex;
  justify-content: space-between;
}

.version-box {
  align-self: center;
}

.logo {
  max-height: 42px;
  min-height: 42px;
}

.page-title {
  left: 300px;
  line-height: 60px;
  position: fixed;
}
</style>
