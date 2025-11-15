/**
 * Menu Parser Utility
 * Parses OCR text from menu images to extract sandwich information
 */

/**
 * Parses menu text and extracts sandwich information
 * @param {string} text - The OCR text from the menu image
 * @returns {Array} Array of parsed sandwich objects with name, type, ingredients, and addons
 */
export function parseMenuText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const sandwiches = []
  let currentSection = null
  let currentSandwich = null

  console.log('Parsing menu text, total lines:', lines.length)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    const lineClean = lineLower.replace(/[^\w\s]/g, '').trim()

    // STEP 1: Detect section headers FIRST
    // Look for "Focaccia Sandwiches" first (check before Hoagie to catch it even if we're in Hoagie section)
    const isFocacciaHeader =
      lineClean.includes('focaccia') ||
      lineClean.includes('focacciasandwiches') ||
      lineLower.includes('focaccia sandwich') ||
      lineLower.includes('focaccia sandwiches') ||
      lineClean.match(/focac[cl]ia/) ||
      (lineClean.includes('focac') && lineClean.length < 25 && !lineClean.includes('hoag'))

    // Look for "Hoagies" (plural) - this appears first in menus
    const isHoagieHeader =
      (lineClean === 'hoagies' ||
       lineClean.includes('hoagies') ||
       lineClean.match(/^hoag[1i]es$/) ||
       (lineClean.includes('hoag') && lineClean.length < 15 && !lineClean.includes('sandwich'))) &&
      !isFocacciaHeader  // Make sure it's not Focaccia

    // Check Focaccia first (can appear after Hoagies, need to switch sections)
    if (isFocacciaHeader) {
      console.log('✅ Found Focaccia header:', line, '| Clean:', lineClean)
      // Save current sandwich before switching sections
      if (currentSandwich && currentSandwich.name) {
        sandwiches.push(currentSandwich)
        currentSandwich = null
      }
      currentSection = 'Focaccia'
      continue
    }

    // Then check Hoagies (appears first in menu)
    if (isHoagieHeader && !currentSection) {
      console.log('✅ Found Hoagies header:', line, '| Clean:', lineClean)
      currentSection = 'Hoagie'
      continue
    }

    // Skip if we don't have a section yet
    if (!currentSection) {
      continue
    }

    // Skip page numbers, dates, day names
    if (line.match(/^\d+\/\d+$/) ||
        line.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i) ||
        line.match(/^page\s+\d+/i)) {
      continue
    }

    // Skip very long lines (likely descriptions or headers)
    if (line.length > 60) {
      continue
    }

    // STEP 2: Detect sandwich names
    // Sandwich names are usually:
    // - Start with capital letter
    // - Short to medium length (3-50 chars)
    // - Often followed by a colon or ingredients on next line
    // - May start with "The" or "A"
    // - NOT pure ingredient descriptors (lines that are ONLY ingredient names like "Lemon Pepper Aioli")
    //   But allow sandwich names that contain ingredient words (like "Eby Egg and Cheese")
    const isPureIngredientDescriptor =
      line.length < 40 && // Short lines are more likely to be pure ingredients
      lineLower.match(/^(.*\s+)?(aioli|mayo|mayonnaise|dressing|sauce|spread|butter|cream|vinaigrette|labneh|salsa|chutney|relish)(\s+.*)?$/i) &&
      !lineLower.match(/\b(egg|sandwich|club|melt|tonnata|pastrami|italian|cubano|muffuletta|porchetta|gobfather|beetnik|farinata|brie|salmon|wagon|romaine)\b/i) // Exclude if it contains sandwich name words

    const isSandwichName =
      line.length >= 3 &&
      line.length <= 50 &&
      /^[A-Z]/.test(line) &&  // Starts with capital
      !line.includes(':') &&  // No colon in name itself (ingredients might have colons)
      !line.match(/^\d+/) &&  // Doesn't start with number
      !lineLower.includes('ingredient') &&
      !lineLower.includes('contains') &&
      !isPureIngredientDescriptor  // Exclude pure ingredient descriptors

    // Check if next line looks like ingredients (has commas, "and", or is long)
    const nextLineIsIngredients = i + 1 < lines.length &&
      (lines[i + 1].includes(',') ||
       lines[i + 1].includes('and') ||
       lines[i + 1].length > 30)

    if (isSandwichName && (nextLineIsIngredients || i + 1 >= lines.length)) {
      // Save previous sandwich
      if (currentSandwich && currentSandwich.name) {
        sandwiches.push(currentSandwich)
      }

      // Extract sandwich name
      let name = line.replace(/[^\w\s&'-]/g, '').trim()
      name = name.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')

      // Get ingredients from next line(s)
      let ingredientsText = ''
      let j = i + 1
      while (j < lines.length && j < i + 3) { // Check up to 2 lines ahead
        const nextLine = lines[j]
        const nextLineLower = nextLine.toLowerCase()
        const nextLineClean = nextLineLower.replace(/[^\w\s]/g, '').trim()

        // Check if this is a section header - if so, stop here
        const isNextLineFocacciaHeader =
          nextLineClean.includes('focaccia') ||
          nextLineClean.includes('focacciasandwiches') ||
          nextLineLower.includes('focaccia sandwich') ||
          nextLineLower.includes('focaccia sandwiches')

        const isNextLineHoagieHeader =
          nextLineClean === 'hoagies' ||
          nextLineClean.includes('hoagies')

        if (isNextLineFocacciaHeader || isNextLineHoagieHeader) {
          break // Stop - we've hit a section header
        }

        // If line has commas, "and", or is long, it's likely ingredients
        if (nextLine.includes(',') ||
            nextLine.includes('and') ||
            (nextLine.length > 20 && !nextLine.match(/^\$?\d+\.?\d*$/))) {
          // Check if it's an addon line instead
          if (nextLine.match(/(?:Add|add|\+)/i)) {
            break // Stop here, we'll process addon separately
          }
          ingredientsText += (ingredientsText ? ', ' : '') + nextLine
          j++
        } else {
          break
        }
      }

      currentSandwich = {
        name: name,
        type: currentSection,
        ingredients: ingredientsText.trim(),
        addons: [],
        rawLine: line
      }

      console.log(`  📝 Found sandwich: "${name}" (${currentSection})`)

      // Skip the ingredient lines we just processed
      i = j - 1
      continue
    }

    // STEP 3: Process addons and ingredient continuations for current sandwich
    if (currentSandwich && currentSection) {
      // FIRST: Check if this line is actually a new sandwich name
      const isPureIngredientDescriptor =
        line.length < 40 && // Short lines are more likely to be pure ingredients
        lineLower.match(/^(.*\s+)?(aioli|mayo|mayonnaise|dressing|sauce|spread|butter|cream|vinaigrette|labneh|salsa|chutney|relish)(\s+.*)?$/i) &&
        !lineLower.match(/\b(egg|sandwich|club|melt|tonnata|pastrami|italian|cubano|muffuletta|porchetta|gobfather|beetnik|farinata|brie|salmon|wagon|romaine)\b/i) // Exclude if it contains sandwich name words

      const couldBeNewSandwich =
        line.length >= 3 &&
        line.length <= 50 &&
        /^[A-Z]/.test(line) &&
        !line.includes(':') &&
        !line.match(/^\d+/) &&
        !lineLower.includes('ingredient') &&
        !lineLower.includes('contains') &&
        !lineLower.match(/^(add|deluxe|option)/) &&
        !isPureIngredientDescriptor  // Exclude pure ingredient descriptors

      const nextLineHasIngredients = i + 1 < lines.length &&
        (lines[i + 1].includes(',') ||
         lines[i + 1].includes('and') ||
         lines[i + 1].length > 30) &&
        !lines[i + 1].match(/^(focaccia|hoagie)/i)

      // If this looks like a new sandwich name, save current and process as new sandwich
      if (couldBeNewSandwich && nextLineHasIngredients) {
        console.log(`  🔄 Line ${i}: Detected new sandwich "${line}", saving previous "${currentSandwich.name}"`)
        sandwiches.push(currentSandwich)

        // Process this line as a new sandwich
        let name = line.replace(/[^\w\s&'-]/g, '').trim()
        name = name.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')

        let ingredientsText = ''
        let j = i + 1
        while (j < lines.length && j < i + 3) {
          const nextLine = lines[j]
          const nextLineLower = nextLine.toLowerCase()
          const nextLineClean = nextLineLower.replace(/[^\w\s]/g, '').trim()

          const isNextLineFocacciaHeader =
            nextLineClean.includes('focaccia') ||
            nextLineClean.includes('focacciasandwiches') ||
            nextLineLower.includes('focaccia sandwich') ||
            nextLineLower.includes('focaccia sandwiches')

          const isNextLineHoagieHeader =
            nextLineClean === 'hoagies' ||
            nextLineClean.includes('hoagies')

          if (isNextLineFocacciaHeader || isNextLineHoagieHeader) {
            break
          }

          if (nextLine.includes(',') ||
              nextLine.includes('and') ||
              (nextLine.length > 20 && !nextLine.match(/^\$?\d+\.?\d*$/))) {
            if (nextLine.match(/(?:Add|add|\+)/i)) {
              break
            }
            ingredientsText += (ingredientsText ? ', ' : '') + nextLine
            j++
          } else {
            break
          }
        }

        currentSandwich = {
          name: name,
          type: currentSection,
          ingredients: ingredientsText.trim(),
          addons: [],
          rawLine: line
        }

        console.log(`  📝 Found sandwich: "${name}" (${currentSection})`)

        i = j - 1
        continue
      }

      // Otherwise, process as addon or ingredient continuation
      const addonMatch =
        line.match(/(?:Add|add)\s+(.+)/i) ||
        line.match(/^\+(.+)/) ||
        line.match(/^\+?\s*(?:Add|add)\s+(.+)/i) ||
        line.match(/deluxe.*(?:Add|add)\s+(.+)/i)  // "Deluxe option: Add Fresh Mozzarella"

      if (addonMatch) {
        let addonName = addonMatch[1]
          .trim()
          .replace(/^add\s+/i, '')
          .replace(/^option:\s*/i, '')
          .trim()

        if (addonName && addonName.length > 0 && !currentSandwich.addons.includes(addonName)) {
          console.log(`    ➕ Found addon: "${addonName}"`)
          currentSandwich.addons.push(addonName)
        }
      } else if (line.length > 10 && !line.match(/^\$?\d+\.?\d*$/)) {
        if (line.includes(',') || line.includes('and') || line.length > 20) {
          if (!(/^[A-Z]/.test(line) && line.length < 50)) {
            currentSandwich.ingredients += (currentSandwich.ingredients ? ', ' : '') + line
          }
        }
      }
    }
  }

  // Add last sandwich (important: this catches the last sandwich in each section)
  if (currentSandwich && currentSandwich.name) {
    sandwiches.push(currentSandwich)
  }

  // Clean up results
  const cleanedSandwiches = sandwiches.map(s => ({
    ...s,
    name: s.name.trim(),
    ingredients: s.ingredients.replace(/[^\w\s,.\-&]/g, '').trim()
  })).filter(s => s.name.length > 2)

  console.log('📊 Final parsed sandwiches:', cleanedSandwiches.length)
  cleanedSandwiches.forEach(s => {
    console.log(`  ✓ ${s.name} (${s.type}) - ${s.addons.length} addon(s)`)
  })

  return cleanedSandwiches
}
