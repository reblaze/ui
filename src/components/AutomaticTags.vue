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
    tagID: String,
    tagName: String,
    tagCategory: String,
    tagSubCategory: String,
  },
  computed: {
    automaticTags(): string {
      const tagCategoryElement = this.tagCategory ? this.createTagElement(this.tagCategory) : this.tagCategory
      const tagSubCategoryElement = this.tagSubCategory ? this.createTagElement(this.tagSubCategory):
        this.tagSubCategory
      const tagIdElement = this.createTagElement(this.tagID)
      const tagNameElement = this.tagName ? this.createTagElement(this.tagName) : this.tagName
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
