// @ts-nocheck
import LimitOption, {OptionObject} from '@/components/LimitOption.vue'
import {beforeEach, describe, expect, test} from '@jest/globals'
import {mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import {LimitOptionType} from '../../types'

describe('LimitOption.vue', () => {
  let option: OptionObject
  let allAttributes = []
  let wrapper: any
  let onUpdate: any
  beforeEach(async () => {
    option = {
      'self': 'self',
    }
    allAttributes = [
      'Authority',
      'Company',
      'Country',
      'IP Address',
      'Method',
      'Network',
      'Path',
      'Path Matching ID',
      'Provider',
      'Query',
      'Region',
      'Security Policy ID',
      'Session ID',
      'Subregion',
      'Tag',
      'URI',
    ]
    onUpdate = async (option: LimitOptionType) => {
      await wrapper.setProps({option})
    }
    wrapper = mount(LimitOption, {
      props: {
        'option': option,
        'useDefaultSelf': true,
        'onUpdate:option': onUpdate,
      },
    })
    await nextTick()
  })

  test('should render dropdown correctly with all possible types as options', () => {
    const selection = wrapper.find('.option-type-selection')
    const options = selection.findAll('option')
    expect(options.at(0).text()).toEqual('HTTP request')
    expect(options.at(1).text()).toEqual('Header')
    expect(options.at(2).text()).toEqual('Cookie')
    expect(options.at(3).text()).toEqual('Argument')
    expect(options.at(4).text()).toEqual('Attribute')
  })

  test('should render dropdown correctly without self as possible type as option', async () => {
    wrapper.setProps({useDefaultSelf: false})
    await nextTick()
    const selection = wrapper.find('.option-type-selection')
    const options = selection.findAll('option')
    expect(options.at(0).text()).toEqual('Header')
    expect(options.at(1).text()).toEqual('Cookie')
    expect(options.at(2).text()).toEqual('Argument')
    expect(options.at(3).text()).toEqual('Attribute')
  })

  describe('showRemove prop', () => {
    test('should show button if showRemove prop is true', async () => {
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'showRemove': true,
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const button = wrapper.find('.remove-option-button')
      expect(button.exists()).toBeTruthy()
    })

    test('should not show button if showRemove prop is false', async () => {
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'showRemove': false,
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const button = wrapper.find('.remove-option-button')
      expect(button.exists()).toBeFalsy()
    })

    test('should not show button if showRemove prop does not exist', async () => {
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const button = wrapper.find('.remove-option-button')
      expect(button.exists()).toBeFalsy()
    })
  })

  describe('ignoreAttributes prop', () => {
    test('should render dropdown correctly without ignored action types (tags, method)', async () => {
      allAttributes = allAttributes.filter((item) => {
        return !['Tag', 'Method'].includes(item)
      })
      option = {
        'attrs': '',
      }
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'ignoreAttributes': ['tags', 'method'],
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const selection = wrapper.find('.option-attribute-selection')
      const options = selection.findAll('option')
      options.forEach((option, index) => {
        expect(option.text()).toEqual(allAttributes[index])
      })
    })

    test('should render dropdown correctly without ignored action types (ip, uri, company)', async () => {
      allAttributes = allAttributes.filter((item) => {
        return !['IP Address', 'URI', 'Company'].includes(item)
      })
      option = {
        'attrs': '',
      }
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'ignoreAttributes': ['ip', 'uri', 'company'],
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const selection = wrapper.find('.option-attribute-selection')
      const options = selection.findAll('option')
      options.forEach((option, index) => {
        expect(option.text()).toEqual(allAttributes[index])
      })
    })

    test('should render dropdown correctly with all types if ignore is empty array', async () => {
      option = {
        'attrs': '',
      }
      wrapper = mount(LimitOption, {
        props: {
          'option': option,
          'ignoreAttributes': [],
          'onUpdate:option': onUpdate,
        },
      })
      await nextTick()
      const selection = wrapper.find('.option-attribute-selection')
      const options = selection.findAll('option')
      options.forEach((option, index) => {
        expect(option.text()).toEqual(allAttributes[index])
      })
    })
  })

  describe('emit changes', () => {
    describe('type dropdown', () => {
      test('should emit new option when type selected from dropdown - self - headers - self', async () => {
        const wantedEmit = {
          'self': 'self',
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        // set to not self so we would be able to change to default
        await selection.setValue(options.at(1).element.value)
        await selection.setValue(options.at(0).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
      })

      test('should emit new option when type selected from dropdown - headers', async () => {
        const wantedEmit = {
          'headers': '',
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(1).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
      })

      test('should emit new option when type selected from dropdown - cookies', async () => {
        const wantedEmit = {
          'cookies': '',
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(2).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
      })

      test('should emit new option when type selected from dropdown - args', async () => {
        const wantedEmit = {
          'args': '',
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(3).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
      })

      test('should emit new option when type selected from dropdown - attrs', async () => {
        const wantedEmit = {
          'attrs': 'ip',
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(4).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
      })
    })

    describe('key changes', () => {
      test('should emit new option when key input changes - headers', async () => {
        const wantedKeyValue = 'foo'
        const wantedEmit = {
          'headers': wantedKeyValue,
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(1).element.value)
        const input = wrapper.find('.option-name-input')
        await input.setValue(wantedKeyValue)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
      })

      test('should emit new option when key selected from dropdown - cookies', async () => {
        const wantedKeyValue = 'foo'
        const wantedEmit = {
          'cookies': wantedKeyValue,
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(2).element.value)
        const input = wrapper.find('.option-name-input')
        await input.setValue(wantedKeyValue)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
      })

      test('should emit new option when key input changes - args', async () => {
        const wantedKeyValue = 'foo'
        const wantedEmit = {
          'args': wantedKeyValue,
        }
        const selection = wrapper.find('.option-type-selection')
        const options = selection.findAll('option')
        await selection.setValue(options.at(3).element.value)
        const input = wrapper.find('.option-name-input')
        await input.setValue(wantedKeyValue)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
      })

      test('should emit new option when key selected from dropdown - attrs', async () => {
        const wantedEmit = {
          'attrs': 'ip',
        }
        const typeSelection = wrapper.find('.option-type-selection')
        const typeOptions = typeSelection.findAll('option')
        await typeSelection.setValue(typeOptions.at(4).element.value)
        const keySelection = wrapper.find('.option-attribute-selection')
        const keyOptions = keySelection.findAll('option')
        await keySelection.setValue(keyOptions.at(3).element.value)
        expect(wrapper.emitted('update:option')).toBeTruthy()
        expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
      })
    })

    describe('option prop', () => {
      describe('semi-given options prop', () => {
        beforeEach(async () => {
          wrapper = mount(LimitOption, {
            props: {
              'option': {},
              'onUpdate:option': onUpdate,
            },
          })
          await nextTick()
          const selection = wrapper.find('.option-type-selection')
          const options = selection.findAll('option')
          await selection.setValue(options.at(2).element.value)
          await wrapper.vm.$forceUpdate()
        })

        test('should emit type change correctly', () => {
          const wantedEmit = {
            'args': '',
          }
          expect(wrapper.emitted('update:option')).toBeTruthy()
          expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
        })

        test('should emit key change correctly', async () => {
          const wantedKeyValue = 'foo'
          const wantedEmit = {
            'args': wantedKeyValue,
          }
          const input = wrapper.find('.option-name-input')
          input.setValue(wantedKeyValue)
          await nextTick()
          expect(wrapper.emitted('update:option')).toBeTruthy()
          expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
        })
      })

      describe('no options prop', () => {
        beforeEach(async () => {
          wrapper = mount(LimitOption, {
            props: {
              'option': undefined,
              'onUpdate:option': onUpdate,
            },
          })
          await nextTick()
          const selection = wrapper.find('.option-type-selection')
          const options = selection.findAll('option')
          await selection.setValue(options.at(2).element.value)
          await wrapper.vm.$forceUpdate()
        })

        test('should emit type change correctly', () => {
          const wantedEmit = {
            'args': '',
          }
          expect(wrapper.emitted('update:option')).toBeTruthy()
          expect(wrapper.emitted('update:option')[0]).toEqual([wantedEmit])
        })

        test('should emit key change correctly', async () => {
          const wantedKeyValue = 'foo'
          const wantedEmit = {
            'args': wantedKeyValue,
          }
          const input = wrapper.find('.option-name-input')
          input.setValue(wantedKeyValue)
          await nextTick()
          expect(wrapper.emitted('update:option')).toBeTruthy()
          expect(wrapper.emitted('update:option')[1]).toEqual([wantedEmit])
        })
      })
    })

    describe('remove', () => {
      test('should emit remove correctly', async () => {
        wrapper = mount(LimitOption, {
          props: {
            'option': option,
            'showRemove': true,
            'removable': true,
            'onUpdate:option': onUpdate,
          },
        })
        await nextTick()
        const button = wrapper.find('.remove-option-button')
        button.trigger('click')
        await nextTick()
        expect(wrapper.emitted('remove')).toBeTruthy()
      })

      test('should not emit key change if removable prop is false', async () => {
        wrapper = mount(LimitOption, {
          props: {
            'option': option,
            'showRemove': true,
            'removable': false,
            'onUpdate:option': onUpdate,
          },
        })
        await nextTick()
        const button = wrapper.find('.remove-option-button')
        button.trigger('click')
        await nextTick()
        expect(wrapper.emitted('remove')).toBeFalsy()
      })
    })
  })
})
