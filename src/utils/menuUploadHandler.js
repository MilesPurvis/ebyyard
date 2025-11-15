/**
 * Menu Upload Handler Utility
 * Handles the complete flow of uploading and processing menu images
 */

import { createWorker } from 'tesseract.js'
import { getAllSandwiches, toggleSandwichActive, setAllSandwichesInactive, addSandwich } from '../db/database.js'
import { parseMenuText } from './menuParser.js'

/**
 * Processes a menu image file and updates the database
 * @param {File} file - The image file to process
 * @param {Function} onStatusUpdate - Callback function to update status messages
 * @returns {Promise<Object>} Object with processing results (processed, activated, created counts)
 */
export async function processMenuUpload(file, onStatusUpdate) {
  if (!file) {
    throw new Error('No file provided')
  }

  // Update status: Clearing existing menu
  onStatusUpdate('Clearing existing menu...')

  try {
    // Clear all existing sandwiches first
    await setAllSandwichesInactive()

    // Update status: Extracting text
    onStatusUpdate('Extracting text from image...')

    // Extract text using OCR
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()

    // Update status: Parsing
    onStatusUpdate('Parsing sandwiches...')

    // Parse the text
    const parsedSandwiches = parseMenuText(text)

    if (parsedSandwiches.length === 0) {
      throw new Error('No sandwiches found in the menu. Please check the image quality.')
    }

    // Update status: Processing
    onStatusUpdate(`Processing ${parsedSandwiches.length} sandwiches...`)

    // Process each sandwich
    const existingSandwiches = await getAllSandwiches()
    let processed = 0
    let activated = 0
    let created = 0

    for (const sandwich of parsedSandwiches) {
      try {
        const normalizedName = sandwich.name.toLowerCase().trim()
        const existing = existingSandwiches.find(s => {
          const existingName = s.name.toLowerCase().trim()
          return existingName === normalizedName ||
                 existingName.includes(normalizedName) ||
                 normalizedName.includes(existingName)
        })

        if (existing) {
          if (!existing.is_active) {
            await toggleSandwichActive(existing.id, true)
            activated++
          }
        } else {
          // Determine if sandwich is vegetarian based on ingredients
          const ingredientsLower = (sandwich.ingredients || '').toLowerCase()
          const nameLower = sandwich.name.toLowerCase()

          // Common non-vegetarian ingredients
          const nonVegKeywords = [
            'meat', 'beef', 'pork', 'chicken', 'turkey', 'ham', 'salami',
            'prosciutto', 'pastrami', 'bacon', 'salmon', 'tuna', 'fish',
            'sopressata', 'capicola', 'coppa', 'mortadella', 'cotto',
            'braised', 'roasted.*sausage', 'sausage'
          ]

          const isVegetarian = !nonVegKeywords.some(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i')
            return regex.test(ingredientsLower) || regex.test(nameLower)
          })

          // Set price: $15.99 for vegetarian, $17.99 for others
          const defaultPrice = isVegetarian ? 15.99 : 17.99

          // Convert addons array to format expected by addSandwich
          // Set default prices for common addons
          const getAddonPrice = (addonName) => {
            const nameLower = addonName.toLowerCase()
            if (nameLower.includes('bacon')) {
              return 3.00
            } else if (nameLower.includes('mozzarella') || nameLower.includes('mozz')) {
              return 2.00
            } else if (nameLower.includes('provolone') || nameLower.includes('prov')) {
              return 2.00
            }
            return 0 // Default price for unknown addons
          }

          const addons = (sandwich.addons || []).map(addonName => ({
            name: addonName,
            price: getAddonPrice(addonName)
          }))
          await addSandwich(
            sandwich.name,
            sandwich.type,
            sandwich.ingredients,
            defaultPrice,
            true,
            addons
          )
          created++
        }
        processed++
      } catch (error) {
        console.error(`Error processing ${sandwich.name}:`, error)
      }
    }

    // Clear status
    onStatusUpdate('')

    return {
      processed,
      activated,
      created
    }
  } catch (error) {
    onStatusUpdate('')
    throw error
  }
}
