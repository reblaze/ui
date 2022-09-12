// @ts-nocheck
import ContentFilterRulesEditor from '@/doc-editors/ContentFilterRulesEditor.vue'
import {beforeEach, describe, expect, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import {ContentFilterRule} from '@/types'

describe('ContentFilterRulesEditor.vue', () => {
  let docs: ContentFilterRule[]
  let wrapper: VueWrapper
  beforeEach(async () => {
    docs = [{
      'id': '100000',
      'name': '100000',
      'msg': 'SQLi Attempt (Conditional Operator Detected)',
      'operand': '\\s(and|or)\\s+\\d+\\s+.*between\\s.*\\d+\\s+and\\s+\\d+.*',
      'risk': 5,
      'description': 'SQL injection',
      'category': 'sqli',
      'subcategory': 'statement injection',
      'tags': [],
    }]
    wrapper = shallowMount(ContentFilterRulesEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
  })

  describe('form data', () => {
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(docs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].name)
    })

    test('should have correct los message in input', () => {
      const element = wrapper.find('.document-msg').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].msg)
    })

    test('should have correct operand in input', () => {
      const element = wrapper.find('.document-operand').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].operand)
    })

    test('should have correct risk displayed', () => {
      const riskSelection = wrapper.find('.risk-level-selection')
      expect((riskSelection.find('option:checked').element as HTMLOptionElement).value).toEqual(docs[0].risk.toString())
    })

    test('should have correct category displayed', () => {
      const element = wrapper.find('.document-category').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].category)
    })

    test('should have correct subcategory displayed', () => {
      const element = wrapper.find('.document-subcategory').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].subcategory)
    })

    test('should have correct tags displayed - multiple', () => {
      const wantedTags = ['test1', 'test2']
      docs[0].tags = wantedTags
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-tags').element as HTMLInputElement
      expect(element.value).toEqual(wantedTags.join(' '))
    })

    test('should have correct tags displayed - single', () => {
      const wantedTag = 'test1'
      docs[0].tags = [wantedTag]
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-tags').element as HTMLInputElement
      expect(element.value).toEqual(wantedTag)
    })

    test('should have correct tags displayed - empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-tags').element as HTMLInputElement
      expect(element.value).toEqual('')
    })

    test('should have correct automatic tags displayed', () => {
      const element = wrapper.find('.document-automatic-tags').element as HTMLDivElement
      expect(element.innerHTML).toContain(`cf-rule-id:${docs[0].id.replace(/ /g, '-')}`)
      expect(element.innerHTML).toContain(`cf-rule-risk:${docs[0].risk}`)
      expect(element.innerHTML).toContain(`cf-rule-category:${docs[0].category.replace(/ /g, '-')}`)
      expect(element.innerHTML).toContain(`cf-rule-subcategory:${docs[0].subcategory.replace(/ /g, '-')}`)
    })

    test('should have empty automatic tags displayed - empty id', () => {
      delete docs[0].id
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-automatic-tags').element as HTMLDivElement
      expect(element.innerHTML).toContain('cf-rule-id:\n')
    })

    test('should have empty automatic tags displayed - empty category', () => {
      delete docs[0].category
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-automatic-tags').element as HTMLDivElement
      expect(element.innerHTML).toContain('cf-rule-category:\n')
    })

    test('should have empty automatic tags displayed - empty subcategory', () => {
      delete docs[0].subcategory
      wrapper = shallowMount(ContentFilterRulesEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const element = wrapper.find('.document-automatic-tags').element as HTMLDivElement
      expect(element.innerHTML).toContain('cf-rule-subcategory:\n')
    })
  })

  describe('form data change', () => {
    test('should emit doc update when name input changes', async () => {
      const wantedName = 'new name'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.name = wantedName
      const element = wrapper.find('.document-name')
      await element.setValue(wantedName)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when description input changes', async () => {
      const wanteddescription = 'new description'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.description = wanteddescription
      const element = wrapper.find('.document-description')
      element.setValue(wanteddescription)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when category input changes', async () => {
      const wantedCategory = 'new category'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.category = wantedCategory
      const element = wrapper.find('.document-category')
      element.setValue(wantedCategory)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when subcategory input changes', async () => {
      const wantedSubcategory = 'new category'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.subcategory = wantedSubcategory
      const element = wrapper.find('.document-subcategory')
      element.setValue(wantedSubcategory)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when risk level input changes', async () => {
      const wantedRisk = 3
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.risk = wantedRisk
      const selection = wrapper.find('.risk-level-selection')
      const options = selection.findAll('option')
      selection.setValue(options.at(2).element.value)
      // options.at(2).setSelected() // index => value: 0 => 1, 1 => 2, 2 => 3
      await selection.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when log message input changes', async () => {
      const wantedMessage = 'This is a message in the logs'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.msg = wantedMessage
      const element = wrapper.find('.document-msg')
      element.setValue(wantedMessage)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when operand input changes', async () => {
      const wantedOperand = '\\s(and|or)\\s+["\']\\w+["\']\\s+.*between\\s.*["\']\\w+["\']\\s+and\\s+["\']\\w+.*'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.operand = wantedOperand
      const element = wrapper.find('.document-operand')
      element.setValue(wantedOperand)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when tags input changes - single', async () => {
      const wantedTag = 'test1'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.tags = [wantedTag]
      const element = wrapper.find('.document-tags')
      element.setValue(wantedTag)
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should emit doc update when tags input changes - multiple', async () => {
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.tags = []
      const element = wrapper.find('.document-tags')
      element.setValue('')
      await element.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })
  })
})
