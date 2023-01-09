import * as bulmaToast from 'bulma-toast'
import {ToastType} from 'bulma-toast'
import {GenericObject} from '@/types'
import _ from 'lodash'


const invalidityClasses = ` has-text-danger has-background-danger-light`

// Validates an input based on given validator (Function / Boolean) and adds necessary classes if input is invalid
const validateInput = (event: Event, validator: Function | boolean) => {
  if (!(event instanceof Event)) {
    return false
  }
  let className = (event.target as HTMLElement)?.className
  let isValid
  className = className.replace(`${invalidityClasses}`, '')
  if (typeof validator === 'function') {
    isValid = validator(event)
  } else {
    isValid = validator
  }
  if (!isValid) {
    className += `${invalidityClasses}`
  }
  (event.target as HTMLElement).className = className
  return isValid
}

// Clear invalidity classes from an input
const clearInputValidationClasses = (element: HTMLElement) => {
  let className = element.className
  className = className.replace(`${invalidityClasses}`, '')
  element.className = className
}

// Generates a unique name in a given entities list
const generateUniqueEntityName = (originalName: string, entitiesList: string[],
                                  isCopy?: boolean, divider = ' ') => {
  if (!originalName) {
    originalName = `new${divider}entity`
  }
  let namePrefix = ''
  if (isCopy) {
    namePrefix = `copy${divider}of${divider}`
  }
  let newName = `${namePrefix}${originalName}`
  let counter = 1
  while (entitiesList.includes(newName)) {
    counter++
    newName = `${namePrefix}${originalName}(${counter})`
  }
  return newName
}

// Download data as file
const downloadFile = (fileName: string, fileType: string, data: any) => {
  // Check if file type can be downloaded
  const recognizedDownloadFileTypes = ['json', 'pfx']
  if (!recognizedDownloadFileTypes.includes(fileType)) {
    console.log('Unable to download file, unknown file type')
    return
  }
  let blob
  if (fileType === 'json') {
    const content: BlobPart = JSON.stringify(data)
    blob = new Blob([content], {
      type: `application/${fileType}`,
    })
  }
  if (fileType === 'pfx') {
    blob = data
  }
  // Create anchor element with download data
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `${fileName}.${fileType}`
  // Click initiates the download
  link.click()
}

// Default values for toast messages
bulmaToast.setDefaults({
  position: 'bottom-left',
  closeOnClick: false,
  dismissible: true,
  duration: 10000,
  opacity: 0.9,
})

// Displays a toast message
const toast = (message: string | HTMLElement, type: ToastType, undoFunction?: () => any) => {
  let element
  if (undoFunction) {
    element = buildToastUndoElement(message, undoFunction)
  } else {
    element = message
  }
  bulmaToast.toast({
    message: element,
    type: type,
  })
}

// Builds the UI element with undo functionality for the toast messages
const buildToastUndoElement = (message: string | HTMLElement, undoFunction: () => any) => {
  const element = document.createElement('div')
  let textElement
  message = message ? message : ''
  if (typeof message === 'string') {
    textElement = document.createElement('span')
    textElement.innerText = message
  } else {
    textElement = message
  }
  element.appendChild(textElement)
  const undoInfoPrefixElement = document.createElement('span')
  undoInfoPrefixElement.innerText = '\nTo undo this action, click '
  const undoElement = document.createElement('a')
  undoElement.onclick = undoFunction
  undoElement.innerText = 'here'
  const undoInfoSuffixElement = document.createElement('span')
  undoInfoSuffixElement.innerText = '.'
  element.appendChild(undoInfoPrefixElement)
  element.appendChild(undoElement)
  element.appendChild(undoInfoSuffixElement)
  return element
}

const removeExtraWhitespaces = (value: string) => {
  return value?.replace(/\s\s+/g, ' ') || ''
}

const amountSuffixFormatter = (value: number) => {
  const lookup = [
    {value: 1, symbol: ''},
    {value: 1e3, symbol: 'K'},
    {value: 1e6, symbol: 'M'},
    {value: 1e9, symbol: 'B'},
    {value: 1e12, symbol: 'T'},
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup.slice().reverse().find((item) => {
    return value >= item.value
  })
  return item ? (value / item.value).toFixed(0).toString().replace(rx, '$1') + item.symbol : '0'
}

const amountSuffixFormatterBytes = (value: number) => {
  if (!value) {
    return '0 Bytes'
  }
  const lookup = [
    {value: 1, symbol: ' Bytes'},
    {value: 1024, symbol: ' KB'},
    {value: Math.pow(1024, 2), symbol: ' MB'},
    {value: Math.pow(1024, 3), symbol: ' GB'},
    {value: Math.pow(1024, 4), symbol: ' TB'},
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup.slice().reverse().find((item) => {
    return value >= item.value
  })
  return (value / item.value).toFixed(2).toString().replace(rx, '$1') + item.symbol
}

const hexToRgbArray = (hex: string) => {
  let colors: string[]
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    colors = hex.substring(1).split('')
    if (colors.length == 3) {
      colors = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]]
    }
    const color = '0x' + colors.join('')
    const colorNumber = Number(color)
    return [(colorNumber >> 16) & 255, (colorNumber >> 8) & 255, colorNumber & 255]
  }
}

const sortArrayByName = (docArray: GenericObject[]) => {
  return docArray.sort((a: GenericObject, b: GenericObject) => {
    let sortValueA: string = a.name || ''
    let sortValueB: string = b.name || ''
    const sortValueALowerCase: string = sortValueA.toString().toLowerCase()
    const sortValueBLowerCase: string = sortValueB.toString().toLowerCase()
    // only ignore case if the values are different from one another
    if (!_.isEqual(sortValueALowerCase, sortValueBLowerCase)) {
      sortValueA = sortValueALowerCase
      sortValueB = sortValueBLowerCase
    }
    if (sortValueA < sortValueB) {
      return -1
    }
    if (sortValueA > sortValueB) {
      return 1
    }
    return 0
  })
}

const nextCharacter = (character: string) => {
  return String.fromCharCode(character.charCodeAt(0) + 1)
}

const parseJwt = (token: string) => {
  const base64Url = token?.split('.')?.[1] || ''
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
  let parsedValue
  try {
    parsedValue = JSON.parse(jsonPayload)
  } catch (err) {
    parsedValue = {}
  }
  return parsedValue
}

export default {
  name: 'Utils',
  validateInput,
  clearInputValidationClasses,
  generateUniqueEntityName,
  downloadFile,
  toast,
  removeExtraWhitespaces,
  amountSuffixFormatter,
  amountSuffixFormatterBytes,
  hexToRgbArray,
  sortArrayByName,
  nextCharacter,
  parseJwt,
}
