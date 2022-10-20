<template >
  <div class="is-size-7 document-automatic-tags">
    <label class="label is-small">
      Automatic Tags:
    </label>
    <div v-html="automaticTags"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'AutomaticTags',

  props: {
    tags: Object,
  },
  computed: {
    automaticTags(): string {
      const tagCategoryElement = this.tags.tagCategory ? this.createTagElement(this.tags.tagCategory) :
        this.tags.tagCategory
      const tagSubCategoryElement = this.tags.tagSubCategory ? this.createTagElement(this.tags.tagSubCategory):
        this.tags.tagSubCategory
      const tagIdElement = this.createTagElement(this.tags.tagID)
      const tagNameElement = this.tags.tagName ? this.createTagElement(this.tags.tagName) : this.tags.tagName
      return `${tagIdElement}${tagNameElement ? tagNameElement : ''}
      ${tagCategoryElement ? tagCategoryElement : ''}${tagSubCategoryElement ? tagSubCategoryElement : ''}`
    },
  },

  methods: {

    createTagElement(tag: string): string {
      return `
        <div
            class="automatic-tag ellipsis"
            title="${tag}">
                ${tag}
        </div>`
    },
  },

})
</script>

<style scoped lang="scss">

</style>
