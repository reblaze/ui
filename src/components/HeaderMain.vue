<template>
  <div class="container">
    <div class="navbar-brand">
      <a class="navbar-item">
        <img src="../assets/logo.png" class="logo" alt="logo">
      </a>
    </div>
    <div class="version-box is-size-7 has-text-grey">
      client version: {{ version || '0.0.0' }}
    </div>
  </div>
</template>

<script lang="ts">

import {default as packageJson} from './../../package.json'
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
