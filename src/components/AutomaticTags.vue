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
import {Document} from '@/types'
import _ from 'lodash'


export default defineComponent({
  name: 'AutomaticTags',

  props: {
    selectedDocType: String,
    selectedDoc: Object,
  },

  // data() {
  //   return {
  //   }
  // },
  computed: {
    localDoc(): Document {
      return _.cloneDeep(this.selectedDoc as Document)
    },

    automaticTags(): string {
      const tag = this.localDoc as any
      let tagID = null
      let tagName = null
      let tagCategory = null
      let tagSubCategory = null
      console.log('this.selectedDocType', this.selectedDocType)
      if (this.selectedDocType === 'aclprofiles') {
        tagID = `acl-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `acl-name:${tag.name}`
      } else if (this.selectedDocType === 'actions') {
        tagID = `cf-rule-id:${tag.id?.replace(/ /g, '-') || ''}`
      } else if (this.selectedDocType === 'dynamic-rules') {
        tagID = `dr-rule-id:${tag.id?.replace(/ /g, '-') || ''}`
      } else if (this.selectedDocType === 'flowcontrol') {
        tagID = `fc-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `fc-name:${tag.name}`
      } else if (this.selectedDocType === 'contentfilterprofiles') {
        tagID = `cf-profile-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `cf-profile-name:${tag.name}`
      } else if (this.selectedDocType === 'contentfilterrules') {
        tagID = `cf-rule-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `cf-rule-risk:${tag.risk}`
        tagCategory = `cf-rule-category:${tag.category?.replace(/ /g, '-') || ''}`
        tagSubCategory = `cf-rule-subcategory:${tag.subcategory?.replace(/ /g, '-') || ''}`
      } else if (this.selectedDocType === 'globalfilters') {
        tagID = `gf-rule-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `gf-rule-name:${tag.name}`
      } else if (this.selectedDocType === 'ratelimits') {
        tagID = `limit-rule-id:${tag.id?.replace(/ /g, '-') || ''}`
        tagName = `limit-rule-name:${tag.name}`
      }

      const tagCategoryElement = tagCategory ? this.createTagElement(tagCategory) : tagCategory
      const tagSubCategoryElement = tagSubCategory ? this.createTagElement(tagSubCategory) : tagSubCategory
      const tagIdElement = this.createTagElement(tagID)
      const tagNameElement = tagName ? this.createTagElement(tagName) : tagName
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
