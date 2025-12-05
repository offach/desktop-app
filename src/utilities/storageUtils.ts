import Tunnel from '../models/Tunnel.ts'
import SettingsModel from '../models/SettingsModel.ts'

// Data version for migration and validation
const DATA_VERSION = '1.0.8'
const DATA_VERSION_KEY = 'tunnlto_data_version'

/* --------------- */
/* Version Control */
/* --------------- */

// Check and update data version
function checkDataVersion(): void {
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY)
  if (storedVersion === null) {
    // First run or data without version - set version but don't clear data
    console.log('First run or data without version, setting version')
    localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
  } else if (storedVersion !== DATA_VERSION) {
    // Version changed - normal on update, don't clear data
    console.log(`Data version updated from ${storedVersion} to ${DATA_VERSION}`)
    localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
  }
  // If version matches, do nothing
}

// Clear all storage data
function clearAllStorageData(): void {
  console.log('Clearing all storage data')
  localStorage.removeItem('tunnels')
  localStorage.removeItem('settings')
  localStorage.removeItem('selectedTunnelID')
}

// Safe JSON parsing with error handling
function safeJsonParse<T>(jsonString: string | null, defaultValue: T): T {
  if (jsonString === null || jsonString === '') {
    return defaultValue
  }
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error)
    console.log('Clearing corrupted data')
    return defaultValue
  }
}

// Validate tunnel structure
function isValidTunnel(tunnel: any): tunnel is Tunnel {
  return (
    tunnel !== null &&
    typeof tunnel === 'object' &&
    typeof tunnel.id === 'string' &&
    typeof tunnel.name === 'string' &&
    tunnel.interface !== undefined &&
    tunnel.peer !== undefined &&
    tunnel.rules !== undefined
  )
}

// Validate all tunnels
function validateTunnels(tunnels: any): Record<string, Tunnel> {
  if (!tunnels || typeof tunnels !== 'object') {
    return {}
  }

  const validTunnels: Record<string, Tunnel> = {}
  for (const [key, tunnel] of Object.entries(tunnels)) {
    if (isValidTunnel(tunnel)) {
      validTunnels[key] = tunnel as Tunnel
    } else {
      console.warn(`Invalid tunnel data for key ${key}, skipping`)
    }
  }
  return validTunnels
}

/* --------------- */
/* Tunnels         */
/* --------------- */

// Get all tunnels
export function getAllTunnelsFromStorage(): Record<string, Tunnel> {
  console.log('Retrieving tunnels from local storage')
  checkDataVersion()
  
  const tunnelsStorageItem = localStorage.getItem('tunnels')
  const rawTunnels = safeJsonParse<Record<string, any>>(tunnelsStorageItem, {})
  const validatedTunnels = validateTunnels(rawTunnels)
  
  if (Object.keys(rawTunnels).length !== Object.keys(validatedTunnels).length) {
    console.warn('Some tunnels were invalid and were removed. Saving cleaned data.')
    saveTunnelsToStorage(validatedTunnels)
  }
  
  return validatedTunnels
}

// Save all tunnels
export function saveTunnelsToStorage(tunnels: Record<string, Tunnel>): void {
  console.log('Saving tunnels to local storage')
  try {
    // Ensure data version is set
    if (localStorage.getItem(DATA_VERSION_KEY) !== DATA_VERSION) {
      localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
    }
    localStorage.setItem('tunnels', JSON.stringify(tunnels))
  } catch (error) {
    console.error('Error saving tunnels to localStorage:', error)
    // If localStorage is full, clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded, clearing old data')
      clearAllStorageData()
      localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
      // Try to save again
      try {
        localStorage.setItem('tunnels', JSON.stringify(tunnels))
      } catch (retryError) {
        console.error('Failed to save tunnels after clearing storage:', retryError)
      }
    }
  }
}

/* --------------- */
/* Tunnel          */
/* --------------- */

// Get data for a tunnel
export function getTunnelFromStorage(tunnelID: string): Tunnel | null {
  console.log(`Retrieving tunnel data for ${tunnelID} from local storage`)
  const tunnels = getAllTunnelsFromStorage()
  if (tunnels[tunnelID] !== null) {
    return tunnels[tunnelID]
  }
  return null
}

/* --------------- */
/* Selected Tunnel */
/* --------------- */

// Delete the selected tunnel key
export function deleteSelectedTunnelIDKeyFromStorage(): void {
  console.log('Deleting the selected tunnel id key from local storage')
  localStorage.removeItem('selectedTunnelID')
}

// Get the selected tunnel
export function getSelectedTunnelIDFromStorage(): string | null {
  const selectedTunnelID = localStorage.getItem('selectedTunnelID')
  console.log(`Retrieved selected tunnel ID ${selectedTunnelID} from local storage`)
  return selectedTunnelID
}

// Save the selected tunnel
export function saveSelectedTunnelIDToStorage(selectedTunnelID: string): void {
  console.log(`Saving selected tunnel ID ${selectedTunnelID} to local storage`)
  localStorage.setItem('selectedTunnelID', selectedTunnelID)
}

/* --------------- */
/* Settings        */
/* --------------- */


// Get the settings
export function getSettingsFromStorage(): SettingsModel {
  console.log('Retrieving settings from local storage')
  checkDataVersion()
  
  const settingsStorageItem = localStorage.getItem('settings')
  const settingsData = safeJsonParse<Partial<SettingsModel>>(settingsStorageItem, {})
  
  // Use the constructor to handle default values and validation
  return new SettingsModel(settingsData)
}

// Save settings
export function saveSettingsToStorage(settings: SettingsModel): void {
  console.log('Saving settings to local storage')
  try {
    // Ensure data version is set
    if (localStorage.getItem(DATA_VERSION_KEY) !== DATA_VERSION) {
      localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
    }
    localStorage.setItem('settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings to localStorage:', error)
    // If localStorage is full, clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded, clearing old data')
      clearAllStorageData()
      localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION)
      // Try to save again
      try {
        localStorage.setItem('settings', JSON.stringify(settings))
      } catch (retryError) {
        console.error('Failed to save settings after clearing storage:', retryError)
      }
    }
  }
}
