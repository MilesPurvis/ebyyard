// Test file for menu parser
// Run with: node test-menu-parser.js

// Simulated OCR output from Wednesday menu
const sampleMenuText = `Wednesday
1/13

Hoagies

The Italian
Mortadella, Salami, Hot Capicola, Provolone, Preserved Cherry Tomatoes, Onions, Organic Greens, Hot Giardinara, Calabrian Mayo
Deluxe option: Add Fresh Mozzarella

Prosciutto and Calabrian Corn Melt
Prosciutto, Fresh Corn with Shredded Provolone, Shallots, Green Onion, Calabrian Chilies and Candied Jalapeno, Garlic Mayo

California Club
Turkey, Bacon, Avocado, Pickled Zucchini, Marinated Onion, Pepper Jack Cheese, Chopped Pepperoncini, Lemon Pepper Aioli

High Five
Ham, Five Brothers Cheese, Breaded Summer Squash, Pickles, Organic Greens, Scallion and Bacon Mayo

Focaccia Sandwiches

Poblano Meatloaf Melt
Poblano Meatloaf, Melted Cheddar, Pickled Jalapeno, Garlic Mayo

The Radiant Dynamo
Roasted Organic Beets, Avocado, Aged Cheddar, Pickled Celery, Organic Greens, Confit Garlic and Zaatar Labneh

Bresola
Bresola, Parmigiano Reggiano, Salmoriglio, Italian Sundried Tomatoes, Organic Greens

Eby Egg and Cheese
Egg, Aged Cheddar, Organic Greens, Eby Chunky Chili Crisp, Garlic Aioli
+Add Bacon`

// Copy the parseMenuText function from ManageMenu.jsx
function parseMenuText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const sandwiches = []
  let currentSection = null
  let currentSandwich = null

  console.log('Parsing menu text, total lines:', lines.length)
  console.log('All lines:')
  lines.forEach((l, idx) => console.log(`  ${idx}: "${l}"`))
  console.log()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    const lineClean = lineLower.replace(/[^\w\s]/g, '').trim()

    // Debug every line
    if (i < 15) { // Show first 15 lines
      console.log(`Line ${i}: "${line}" -> Clean: "${lineClean}"`)
    }

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

    // Debug Focaccia detection
    if (lineLower.includes('focac') || (lineLower.includes('sandwich') && line.length < 30)) {
      console.log(`  🔍 Line ${i}: "${line}" | Clean: "${lineClean}" | isFocaccia: ${isFocacciaHeader}`)
    }

    // Check Focaccia first (can appear after Hoagies, need to switch sections)
    if (isFocacciaHeader) {
      console.log('✅ Found Focaccia header:', line, '| Clean:', lineClean)
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

    // Skip very long lines
    if (line.length > 60) {
      continue
    }

    // STEP 2: Detect sandwich names
    const isSandwichName =
      line.length >= 3 &&
      line.length <= 50 &&
      /^[A-Z]/.test(line) &&
      !line.includes(':') &&
      !line.match(/^\d+/) &&
      !lineLower.includes('ingredient') &&
      !lineLower.includes('contains') &&
      !lineLower.match(/^(add|deluxe|option)/) // Not an addon line

    const nextLineIsIngredients = i + 1 < lines.length &&
      (lines[i + 1].includes(',') ||
       lines[i + 1].includes('and') ||
       lines[i + 1].length > 30) &&
      !lines[i + 1].match(/^(focaccia|hoagie)/i) // Next line isn't a section header

    // Debug sandwich name detection for specific lines
    if (i >= 17 && i <= 21) {
      console.log(`  🔍 Line ${i}: "${line}" | isSandwichName: ${isSandwichName} | nextLineIsIngredients: ${nextLineIsIngredients} | currentSection: ${currentSection}`)
    }

    if (isSandwichName && (nextLineIsIngredients || i + 1 >= lines.length)) {
      if (currentSandwich && currentSandwich.name) {
        sandwiches.push(currentSandwich)
      }

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

    // STEP 3: Process addons and ingredient continuations
    if (currentSandwich && currentSection) {
      // Debug for lines around the problem area
      if (i >= 17 && i <= 21) {
        console.log(`  🔍 STEP3 Line ${i}: "${line}" | currentSandwich: "${currentSandwich.name}"`)
      }

      // FIRST: Check if this line is actually a new sandwich name
      const couldBeNewSandwich =
        line.length >= 3 &&
        line.length <= 50 &&
        /^[A-Z]/.test(line) &&
        !line.includes(':') &&
        !line.match(/^\d+/) &&
        !lineLower.includes('ingredient') &&
        !lineLower.includes('contains') &&
        !lineLower.match(/^(add|deluxe|option)/)

      const nextLineHasIngredients = i + 1 < lines.length &&
        (lines[i + 1].includes(',') ||
         lines[i + 1].includes('and') ||
         lines[i + 1].length > 30) &&
        !lines[i + 1].match(/^(focaccia|hoagie)/i)

      if (i >= 17 && i <= 21) {
        console.log(`    couldBeNewSandwich: ${couldBeNewSandwich}, nextLineHasIngredients: ${nextLineHasIngredients}`)
      }

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
        line.match(/deluxe.*(?:Add|add)\s+(.+)/i)

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

  if (currentSandwich && currentSandwich.name) {
    sandwiches.push(currentSandwich)
  }

  const cleanedSandwiches = sandwiches.map(s => ({
    ...s,
    name: s.name.trim(),
    ingredients: s.ingredients.replace(/[^\w\s,.\-&]/g, '').trim()
  })).filter(s => s.name.length > 2)

  return cleanedSandwiches
}

// Run the test
console.log('='.repeat(60))
console.log('TESTING MENU PARSER')
console.log('='.repeat(60))
console.log()

const result = parseMenuText(sampleMenuText)

console.log()
console.log('='.repeat(60))
console.log('RESULTS')
console.log('='.repeat(60))
console.log()

// Expected results
const expected = {
  hoagies: [
    { name: 'The Italian', addons: ['Fresh Mozzarella'] },
    { name: 'Prosciutto and Calabrian Corn Melt', addons: [] },
    { name: 'California Club', addons: [] },
    { name: 'High Five', addons: [] }
  ],
  focaccia: [
    { name: 'Poblano Meatloaf Melt', addons: [] },
    { name: 'The Radiant Dynamo', addons: [] },
    { name: 'Bresola', addons: [] },
    { name: 'Eby Egg and Cheese', addons: ['Bacon'] }
  ]
}

// Check results
let passed = 0
let failed = 0

console.log('HOAGIES:')
const hoagies = result.filter(s => s.type === 'Hoagie')
console.log(`  Found: ${hoagies.length} (expected: ${expected.hoagies.length})`)
expected.hoagies.forEach((exp, idx) => {
  const found = hoagies[idx]
  if (found && found.name === exp.name) {
    console.log(`  ✓ "${exp.name}"`)
    if (found.addons.length === exp.addons.length) {
      console.log(`    ✓ Addons: ${found.addons.join(', ') || 'none'}`)
      passed++
    } else {
      console.log(`    ✗ Addons mismatch: found ${found.addons.length}, expected ${exp.addons.length}`)
      console.log(`      Found: ${found.addons.join(', ')}`)
      console.log(`      Expected: ${exp.addons.join(', ')}`)
      failed++
    }
    passed++
  } else {
    console.log(`  ✗ Missing or wrong: "${exp.name}"`)
    if (found) console.log(`    Found instead: "${found.name}"`)
    failed++
  }
})

console.log()
console.log('FOCACCIA:')
const focaccia = result.filter(s => s.type === 'Focaccia')
console.log(`  Found: ${focaccia.length} (expected: ${expected.focaccia.length})`)
expected.focaccia.forEach((exp, idx) => {
  const found = focaccia[idx]
  if (found && found.name === exp.name) {
    console.log(`  ✓ "${exp.name}"`)
    if (found.addons.length === exp.addons.length) {
      console.log(`    ✓ Addons: ${found.addons.join(', ') || 'none'}`)
      passed++
    } else {
      console.log(`    ✗ Addons mismatch: found ${found.addons.length}, expected ${exp.addons.length}`)
      console.log(`      Found: ${found.addons.join(', ')}`)
      console.log(`      Expected: ${exp.addons.join(', ')}`)
      failed++
    }
    passed++
  } else {
    console.log(`  ✗ Missing or wrong: "${exp.name}"`)
    if (found) console.log(`    Found instead: "${found.name}"`)
    failed++
  }
})

console.log()
console.log('='.repeat(60))
console.log(`SUMMARY: ${passed} passed, ${failed} failed`)
console.log('='.repeat(60))

// Show all parsed sandwiches
console.log()
console.log('ALL PARSED SANDWICHES:')
result.forEach((s, idx) => {
  console.log(`${idx + 1}. ${s.name} (${s.type})`)
  console.log(`   Ingredients: ${s.ingredients.substring(0, 60)}...`)
  if (s.addons.length > 0) {
    console.log(`   Addons: ${s.addons.join(', ')}`)
  }
})
