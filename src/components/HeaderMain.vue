<template>
  <div class="container is-fluid">
    <div class="navbar-brand">
      <a class="navbar-item"
         href="/">
        <img :src="require('@/assets/logo.png')" class="logo" alt="logo">
      </a>
    </div>
    <div class="version-box is-size-7 has-text-grey">
      client version: {{ version || '0.0.0' }}
    </div>
  </div>
</template>

<script lang="ts">
import packageJson from '@/../package.json'
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'HeaderMain',
  data() {
    return {
      version: packageJson.version,
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
