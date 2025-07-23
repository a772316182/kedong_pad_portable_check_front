import { ipcRenderer } from 'electron'
import { showDialog } from './utils'

export async function getFromStore(key) {
  return await ipcRenderer.invoke('store-get', { key })
}

export async function setToStore(key, value) {
  if (!value) {
    showDialog('Error', 'Value is required')
  }
  return await ipcRenderer.invoke('store-set', { key, value })
}

export async function hasInStore(key) {
  return await ipcRenderer.invoke('store-has', { key })
}

export async function clearStore(key) {
  return await ipcRenderer.invoke('store-clear', { key })
}
