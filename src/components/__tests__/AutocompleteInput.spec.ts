// @ts-nocheck
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper, DOMWrapper} from '@vue/test-utils'
import axios from 'axios'
import * as bulmaToast from 'bulma-toast'
import {Options} from 'bulma-toast'
import {nextTick} from 'vue'

jest.mock('axios')

describe('AutocompleteInput', () => {
  let wrapper: VueWrapper
  let suggestions: AutocompleteSuggestion[]
  beforeEach(() => {
    suggestions = [
      {
        prefix: '<span>prefix html</span>',
        value: 'another-value',
      },
      {
        value: 'devops',
      },
      {
        value: 'internal',
      },
      {
        prefix: 'prefix string',
        value: 'test-value-1',
      },
      {
        value: 'test-value-2',
      },
      {
        value: 'united-states',
      },
    ]
    wrapper = mount(AutocompleteInput, {
      props: {
        suggestions: suggestions,
        autoFocus: true,
        clearInputAfterSelection: false,
      },
    })
  })

  test('should have dropdown hidden on init', () => {
    expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeFalsy()
  })

  test('should have dropdown hidden after typing in input if empty', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({data: {}}))
    wrapper = mount(AutocompleteInput)
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeFalsy()
  })

  test('should have dropdown displayed after typing in input', async () => {
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeTruthy()
  })

  test('should emit changed value when input changes', async () => {
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    expect(wrapper.emitted('value-changed')).toBeTruthy()
    expect(wrapper.emitted('value-changed')[0]).toEqual(['value'])
  })

  test('should show correct filtered values in dropdown ordered alphabetically', async () => {
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    expect(dropdownItems.length).toEqual(3)
    expect(dropdownItems.at(0).text()).toContain('another-value')
    expect(dropdownItems.at(1).text()).toContain('test-value-1')
    expect(dropdownItems.at(2).text()).toContain('test-value-2')
  })

  test('should show correct prefixes in dropdown', async () => {
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    expect(dropdownItems.at(0).html()).toContain('<span>prefix html</span>')
    expect(dropdownItems.at(1).html()).toContain('prefix string')
  })

  test('should show correct filtered values in dropdown ordered alphabetically regardless of casing', async () => {
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    expect(dropdownItems.length).toEqual(3)
    expect(dropdownItems.at(0).text()).toContain('another-value')
    expect(dropdownItems.at(1).text()).toContain('test-value-1')
    expect(dropdownItems.at(2).text()).toContain('test-value-2')
  })

  test('should re-assign the input when prop changes', async () => {
    const newValue = 'another'
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    await wrapper.setProps({initialValue: newValue})
    expect((input.element as HTMLInputElement).value).toEqual(newValue)
  })

  test('should have dropdown hidden when prop changes', async () => {
    const newValue = 'another'
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    await wrapper.setProps({initialValue: newValue})
    expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeFalsy()
  })

  test('should have dropdown hidden when prop changes to the same value', async () => {
    const value = 'value'
    const input = wrapper.find('.autocomplete-input')
    await input.setValue(value)
    await input.trigger('input')
    await wrapper.setProps({initialValue: value})
    expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeTruthy()
  })

  test('should clear autocomplete input when selected', async () => {
    await wrapper.setProps({clearInputAfterSelection: true})
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    await wrapper.setData({focusedSuggestionIndex: 2})
    await input.trigger('keyup.enter')
    expect((input.element as HTMLInputElement).value).toEqual('')
  })

  test('should emit selected value on input blur event', async () => {
    await wrapper.setProps({clearInputAfterSelection: true})
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    await wrapper.setData({focusedSuggestionIndex: 2})
    await input.trigger('blur')
    jest.runAllTimers()
    expect(wrapper.emitted('value-submitted')).toBeTruthy()
    expect(wrapper.emitted('value-submitted')[0]).toEqual(['test-value-2'])
  })

  test('should emit selected value on input blur event with the correct clicked suggestion', async () => {
    await wrapper.setProps({clearInputAfterSelection: true})
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    await input.trigger('blur')
    await dropdownItems.at(1).trigger('mousedown')
    jest.runAllTimers()
    expect(wrapper.emitted('value-submitted')).toBeTruthy()
    expect(wrapper.emitted('value-submitted')[0]).toEqual(['test-value-1'])
  })

  test('should not emit selected value on input blur event if destroyed before finishing', async () => {
    await wrapper.setProps({clearInputAfterSelection: true})
    const input = wrapper.find('.autocomplete-input')
    await input.setValue('value')
    await input.trigger('input')
    await input.trigger('blur')
    wrapper.unmount()
    jest.runAllTimers()
    expect(wrapper.emitted('value-submitted')).toBeFalsy()
  })

  test('should auto focus on the autocomplete input after suggestion clicked' +
    ' if autoFocus prop is true', (done) => {
    wrapper = mount(AutocompleteInput, {
      props: {
        suggestions: suggestions,
        autoFocus: true,
        clearInputAfterSelection: false,
      },
      attachTo: document.body,
    })
    const input = wrapper.find('.autocomplete-input')
    input.setValue('value')
    input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    dropdownItems[1].trigger('mousedown')
    setImmediate(() => {
      expect(input.element).toBe(document.activeElement)
      done()
    })
  })

  test('should not auto focus on the autocomplete input after suggestion clicked' +
    ' if autoFocus prop is false', (done) => {
    wrapper = mount(AutocompleteInput, {
      props: {
        suggestions: suggestions,
        autoFocus: false,
        clearInputAfterSelection: false,
      },
      attachTo: document.body,
    })
    const input = wrapper.find('.autocomplete-input')
    input.setValue('value')
    input.trigger('input')
    const dropdownItems = wrapper.findAll('.dropdown-item')
    dropdownItems[1].trigger('mousedown')
    setImmediate(() => {
      expect(input.element).not.toBe(document.activeElement)
      done()
    })
  })

  describe('keyboard control', () => {
    let input: DOMWrapper
    let dropdownItems: DOMWrapper[]
    beforeEach(async () => {
      input = wrapper.find('.autocomplete-input')
      await input.setValue('value')
      await input.trigger('input')
      dropdownItems = wrapper.findAll('.dropdown-item')
    })

    test('should focus on next item when down arrow is pressed', async () => {
      await input.trigger('keyup.down')
      expect(dropdownItems.at(0).element.classList.contains('is-active')).toBeTruthy()
    })

    test('should focus on previous item when up arrow is pressed', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.up')
      expect(dropdownItems.at(1).element.classList.contains('is-active')).toBeTruthy()
    })

    test('should not focus on next item when down arrow is pressed if focused on last element', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.down')
      expect(dropdownItems.at(2).element.classList.contains('is-active')).toBeTruthy()
    })

    test('should not focus on any item when up arrow is pressed if focused on input', async () => {
      await wrapper.setData({focusedSuggestionIndex: -1})
      await input.trigger('keyup.up')
      expect(dropdownItems.at(0).element.classList.contains('is-active')).toBeFalsy()
      expect(dropdownItems.at(1).element.classList.contains('is-active')).toBeFalsy()
      expect(dropdownItems.at(2).element.classList.contains('is-active')).toBeFalsy()
    })

    test('should set focus on autocomplete Input when click on dropdown suggestion', async () => {
      wrapper = mount(AutocompleteInput, {
        props: {
          suggestions: suggestions,
          autoFocus: true,
          clearInputAfterSelection: false,
        },
        attachTo: document.body,
      })
      const input = wrapper.find('.autocomplete-input')
      let wrapperElement = wrapper.find({ref: 'autocompleteInput'})
      await input.setValue('value')
      await input.trigger('input')
      const dropdownItems = wrapper.findAll('.dropdown-item')
      await dropdownItems.at(1).trigger('mousedown')
      // mousedown fire suggestionClick that fire this.$refs.autocompleteInput.focus() line 198
      await nextTick()
      wrapperElement = wrapper.find({ref: 'autocompleteInput'})
      expect(wrapper.emitted('focus')).toBeTruthy
      expect(wrapperElement.element).toBe(document.activeElement)
    })

    test('should select focused suggestion when enter is pressed', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.enter')
      expect((input.element as HTMLInputElement).value).toEqual('test-value-2')
    })

    test('should select input value when enter is pressed and there is no focused suggestion', async () => {
      await wrapper.setData({focusedSuggestionIndex: -1})
      input.setValue('test-value-1')
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect((input.element as HTMLInputElement).value).toEqual('test-value-1')
    })

    test('should emit selected value when enter is pressed', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.enter')
      expect(wrapper.emitted('value-submitted')).toBeTruthy()
      expect(wrapper.emitted('value-submitted')[0]).toEqual(['test-value-2'])
    })

    test('should select focused suggestion when space is pressed', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.space')
      expect((input.element as HTMLInputElement).value).toEqual('test-value-2')
    })

    test('should select input value when space is pressed and there is no focused suggestion', async () => {
      await wrapper.setData({focusedSuggestionIndex: -1})
      await input.setValue('test-value-1')
      await input.trigger('input')
      await input.trigger('keyup.space')
      expect((input.element as HTMLInputElement).value).toEqual('test-value-1')
    })

    test('should select input value when input is longer than the minimumValueLength prop', async () => {
      await wrapper.setProps({minimumValueLength: 3})
      await input.setValue('test-value-1')
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect(wrapper.emitted('value-submitted')).toBeTruthy()
    })

    test('should not select input value when input is empty', async () => {
      await wrapper.setProps({minimumValueLength: 3})
      await input.setValue('')
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect(wrapper.emitted('value-submitted')).toBeFalsy()
    })

    test('should not select input value when input is shorter than the minimumValueLength prop', async () => {
      await wrapper.setProps({minimumValueLength: 3})
      await input.setValue('t')
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect(wrapper.emitted('value-submitted')).toBeFalsy()
    })

    test('should not display a failure toast after selecting input value when input is empty', async () => {
      const toastOutput: Options[] = []
      jest.spyOn(bulmaToast, 'toast').mockImplementation((output: Options) => {
        toastOutput.push(output)
      })
      await wrapper.setProps({minimumValueLength: 3})
      await input.setValue('')
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect(toastOutput.length).toEqual(0)
      jest.clearAllMocks()
    })

    test('should display a failure toast after selecting' +
      'input value when input is shorter than the minimumValueLength prop', async () => {
      const minLength = 3
      const selectedValue = 't'
      const failureMessage = `Selected value "${selectedValue}" is invalid!\n` +
        `Values must be at least ${minLength} characters long.`
      const failureMessageClass = 'is-danger'
      const toastOutput: Options[] = []
      jest.spyOn(bulmaToast, 'toast').mockImplementation((output: Options) => {
        toastOutput.push(output)
      })
      await wrapper.setProps({minimumValueLength: minLength})
      await input.setValue(selectedValue)
      await input.trigger('input')
      await input.trigger('keyup.enter')
      expect(toastOutput[0].message).toContain(failureMessage)
      expect(toastOutput[0].type).toContain(failureMessageClass)
      jest.clearAllMocks()
    })

    test('should emit selected value when space is pressed', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.space')
      expect(wrapper.emitted('value-submitted')).toBeTruthy()
      expect(wrapper.emitted('value-submitted')[0]).toEqual(['test-value-2'])
    })

    test('should emit filtered value on space pressed', async () => {
      await wrapper.setProps({
        filterFunction: (tag: string) => tag.replace(/[^\w: ]|_/g, '-').toLowerCase(),
      })
      input.element.value = 'test:CHECK-CASE_01'
      await input.trigger('input')
      await input.trigger('keyup.space')
      expect(wrapper.emitted('value-submitted')).toBeTruthy()
      expect(wrapper.emitted('value-submitted')[0]).toEqual(['test:check-case-01'])
    })

    test('should select suggestion when clicked', async () => {
      await dropdownItems.at(1).trigger('mousedown')
      expect((input.element as HTMLInputElement).value).toEqual('test-value-1')
    })

    test('should emit selected value when clicked', async () => {
      await dropdownItems.at(1).trigger('mousedown')
      expect(wrapper.emitted('value-submitted')).toBeTruthy()
      expect(wrapper.emitted('value-submitted')[0]).toEqual(['test-value-1'])
    })

    test('should have dropdown hidden when esc is pressed', async () => {
      await input.trigger('keyup.esc')
      expect(wrapper.find('.dropdown').element.classList.contains('is-active')).toBeFalsy()
    })
  })

  describe('multiple values selection', () => {
    let input: DOMWrapper
    beforeEach(async () => {
      wrapper = mount(AutocompleteInput, {
        props: {
          suggestions: suggestions,
          autoFocus: true,
          selectionType: 'multiple',
        },
      })
      input = wrapper.find('.autocomplete-input')
      await input.setValue('devops value')
      await input.trigger('input')
    })

    test('should filter suggestion based on last word in input', async () => {
      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems.length).toEqual(3)
      expect(dropdownItems.at(0).text()).toContain('another-value')
      expect(dropdownItems.at(1).text()).toContain('test-value-1')
      expect(dropdownItems.at(2).text()).toContain('test-value-2')
    })

    test('should only change last word in input when selecting value with enter', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.enter')
      expect((input.element as HTMLInputElement).value).toEqual('devops test-value-2')
    })

    test('should only change last word in input when selecting value with space', async () => {
      await wrapper.setData({focusedSuggestionIndex: 2})
      await input.trigger('keyup.space')
      expect((input.element as HTMLInputElement).value).toEqual('devops test-value-2')
    })
  })

  describe('selection type prop validator', () => {
    let validator: Function
    beforeEach(() => {
      validator = wrapper.vm.$options.props.selectionType.validator
    })

    test('should return true for `single` type`', () => {
      const isValid = validator('single')
      expect(isValid).toEqual(true)
    })

    test('should return true for `multiple` type`', () => {
      const isValid = validator('multiple')
      expect(isValid).toEqual(true)
    })

    test('should return true for type regardless of casing`', () => {
      const isValid = validator('MuLtIpLe')
      expect(isValid).toEqual(true)
    })

    test('should return false for type not `single` or `multiple`', () => {
      const type = 'unknown value'
      const isValid = validator(type)
      expect(isValid).toEqual(false)
    })

    test('should return false for undefined type', () => {
      const type: string = undefined
      const isValid = validator(type)
      expect(isValid).toEqual(false)
    })


    test('autocompleteValue should changes to initialValue prop when skipNextWatchUpdate = false', async () => {
      wrapper = mount(AutocompleteInput, {
        props: {
          initialValue: 'aylon',
        },
      })
      expect(wrapper.vm.autocompleteValue).toEqual('aylon')
      await wrapper.setProps({initialValue: 'test'})
      expect(wrapper.vm.autocompleteValue).toEqual('test')
    })

    test('autocompleteValue should not changes to initialValue when skipNextWatchUpdate = true', async () => {
      wrapper = mount(AutocompleteInput, {
        props: {
          initialValue: 'aylon',
        },
      })
      await wrapper.setData({skipNextWatchUpdate: true})
      await wrapper.setProps({initialValue: 'test'})
      expect(wrapper.vm.autocompleteValue).toEqual('aylon')
    })

    test('when the component is being unmounted, clearInputBlurredTimeout function is being fired', async () => {
      wrapper = mount(AutocompleteInput)
      const spy = jest.spyOn(wrapper.vm, 'clearInputBlurredTimeout')
      wrapper.unmount()
      expect(spy).toBeDefined()
      expect(spy).toHaveBeenCalled()
    })
  })
})
