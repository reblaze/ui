<template>
  <div class="container is-fluid">
    <div class="navbar-brand">
      <a class="navbar-item">
        <img :src="require('@/assets/logo.png')" class="logo" alt="logo">
      </a>
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

export default defineComponent({
  name: 'HeaderMain',
  data() {
    return {
      clientVersion: packageJson.version,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

})
</script>

<style scoped lang="scss">
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
</style>
