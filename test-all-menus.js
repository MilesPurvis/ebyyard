// Comprehensive test for menu parser with all 4 menu images
// Run with: node test-all-menus.js

// Menu 1: Wednesday
const menu1 = `Wednesday
1/10

Hoagies

Eby Cubano
Braised Pork, Sopressata, Melted Swiss, Pickles and Pickled Jalapeno, Salsa Verde, Dijonaisse

The Italian
Mortadella, Salami, Hot Capicola, Provolone, Preserved Cherry Tomatoes, Onions, Organic Greens, Hot Giardinara, Calabrian Mayo
Deluxe option: Add Fresh Mozzarella

Torrid Turkey
Turkey, Avocado, Aged Cheddar, Salsa Macha (Mexican Chili Crisp), Onions, Organic Greens, Roasted Jalapeno and Garlic Mayo

Eby Muffuletta
Mortadella, Spicy Salami, Coppa, Provolone, Olive Salad, Spicy Giardinara, Pickles, Garlic Herb Butter
+ Add Chopped Calabrian Chilies

Focaccia Sandwiches

Beet Farinata
Italian Chickpea Patty, Roasted Beets, Arugula in Lemon Vinaigrette, Whipped Goat Cheese and Castelvetrano Olive Labneh, Pickled Red Onions

Carne e Brie
Prosciutto Cotto, Salami, Brie, Sundried Tomatoes, Arugula in Lemon Vinaigrette, Herb Cheese Spread

Autumn Smoked Salmon
T&J's Smoked Salmon, Lemon Caper Labneh, Dill and Olive Oil Marinated Cherry Tomatoes, Roasted Squash, Organic Greens

Eby Egg and Cheese
Egg, Aged Cheddar, Organic Greens, Eby Chunky Chili Crisp, Garlic Aioli`

// Menu 2: Thursday
const menu2 = `Thursday
2/10

Hoagies

Carne Tonnata
Thinly Sliced Beef, Tonnato Sauce, Pickled Jalapenos, Sliced White Onion, Herb and Arugula Salad
+Add Melted Provolone

Farmers' Market Green Goddess
Turkey, Aged Cheddar, Organic Local Roasted Lemon Potatoes, Green Goddess Dressing, Pickled Chilies, Organic Greens
+Add Bacon

Hot Pastrami
Beef Pastrami, Pepper Jack Cheese, Herby Coleslaw, Spicy Russian Dressing

The Gobfather
Turkey, Provolone, Fennel Salami, Preserved Cherry Tomatoes, Marinated Onion, Shredded Lettuce, Giardiniera Mayo

Focaccia Sandwiches

Brie Romaine
Thinly Sliced Roasted Potatoes, Warm Brie, Fried Capers, Crumbled Roasted Sausage, Dill Creme Fraiche, Arugula tossed in Lemon and Olive Oil

Turkey BLT Chili Crisp
Turkey, Bacon, Roasted Tomatoes, Chili Crisp, Organic Green, Garlic Aioli

The Beetnik
Roasted Beets, Avocado, Tahini Miso Herb Sauce, Marinated Cherry Tomatoes, Aged Cheddar, Sliced Onion, Organic Greens
+Add Turkey

Eby Egg and Cheese
Egg, Aged Cheddar, Organic Greens, Eby Chunky Chili Crisp, Garlic Aioli`

// Menu 3: Friday
const menu3 = `Friday
3/10

Hoagies

Porchetta
Porchetta, Fennel and Caper Cream Sauce, Marinated Onions, Organic Arugula

Brass-ica Knuckles
Roasted Organic Broccoli, Crispy Bacon, Melted Provolone, Chopped Chilis, Extra Garlic Mayo

She's Gone Country
Chicken, Avocado, Aged Cheddar, Pickles, Roast Potatoes, Cabbage Slaw, Eby Ranch Dressing

The Italian
Mortadella, Salami, Hot Capicola, Provolone, Preserved Cherry Tomatoes, Onions, Organic Greens, Hot Giardinara, Calabrian Mayo
Deluxe : Add Fresh Mozzarella

Focaccia Sandwiches

Mortadella Club
Mortadella, Avocado, Bacon, Marinated Tomato, Organic Greens, Garlic Aioli

The Loaded Wagon
Roasted Carrots, Bacon, Pickled Jalapenos, Herbed Labneh, Organic Greens, Lemon Mayo
+Add Turkey

Autumn Smoked Salmon
T&J's Smoked Salmon, Lemon Caper Labneh, Dill and Olive Oil Marinated Cherry Tomatoes, Roasted Squash, Organic Greens

Eby Egg and Cheese
Egg, Aged Cheddar, Organic Greens, Eby Chunky Chili Crisp, Garlic Aioli`

// Menu 4: Saturday
const menu4 = `Saturday
4/10

Hoagies

Hot Pastrami
Beef Pastrami, Pepper Jack Cheese, Herby Coleslaw, Spicy Russian Dressing

Porchetta
Porchetta, Fennel and Caper Cream Sauce, Marinated Onions, Organic Arugula

The Italian
Mortadella, Salami, Hot Capicola, Provolone, Preserved Cherry Tomatoes, Onions, Organic Greens, Hot Giardinara, Calabrian Mayo
Deluxe: Add Fresh Mozzarella

Farmers' Market Green Goddess
Turkey, Aged Cheddar, Organic Local Roasted Lemon Potatoes, Green Goddess Dressing, Pickled Chilies, Organic Greens
+Add Bacon

California Club
Turkey, Bacon, Avocado, Pickled Zucchini, Marinated Onion, Pepper Jack Cheese, Chopped Pepperoncini, Lemon Pepper Aioli

Focaccia Sandwiches

Beet Farinata
Italian Chickpea Patty, Roasted Beets, Arugula in Lemon Vinaigrette, Whipped Goat Cheese and Castelvetrano Olive Labneh, Pickled Red Onions

Carne e Brie
Prosciutto Cotto, Salami, Brie, Sundried Tomatoes, Arugula in Lemon Vinaigrette, Herb Cheese Spread

Autumn Smoked Salmon
T&J's Smoked Salmon, Lemon Caper Labneh, Dill and Olive Oil Marinated Cherry Tomatoes, Roasted Squash, Organic Greens

Eby Egg and Cheese
Egg, Aged Cheddar, Organic Greens, Eby Chunky Chili Crisp, Garlic Aioli`

// Copy the parseMenuText function from ManageMenu.jsx
function parseMenuText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const sandwiches = []
  let currentSection = null
  let currentSandwich = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    const lineClean = lineLower.replace(/[^\w\s]/g, '').trim()

    // STEP 1: Detect section headers FIRST
    const isFocacciaHeader =
      lineClean.includes('focaccia') ||
      lineClean.includes('focacciasandwiches') ||
      lineLower.includes('focaccia sandwich') ||
      lineLower.includes('focaccia sandwiches') ||
      lineClean.match(/focac[cl]ia/) ||
      (lineClean.includes('focac') && lineClean.length < 25 && !lineClean.includes('hoag'))

    const isHoagieHeader =
      (lineClean === 'hoagies' ||
       lineClean.includes('hoagies') ||
       lineClean.match(/^hoag[1i]es$/) ||
       (lineClean.includes('hoag') && lineClean.length < 15 && !lineClean.includes('sandwich'))) &&
      !isFocacciaHeader

    if (isFocacciaHeader) {
      if (currentSandwich && currentSandwich.name) {
        sandwiches.push(currentSandwich)
        currentSandwich = null
      }
      currentSection = 'Focaccia'
      continue
    }

    if (isHoagieHeader && !currentSection) {
      currentSection = 'Hoagie'
      continue
    }

    if (!currentSection) {
      continue
    }

    if (line.match(/^\d+\/\d+$/) ||
        line.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i) ||
        line.match(/^page\s+\d+/i)) {
      continue
    }

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
      !lineLower.match(/^(add|deluxe|option)/)

    const nextLineIsIngredients = i + 1 < lines.length &&
      (lines[i + 1].includes(',') ||
       lines[i + 1].includes('and') ||
       lines[i + 1].length > 30) &&
      !lines[i + 1].match(/^(focaccia|hoagie)/i)

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

      i = j - 1
      continue
    }

    // STEP 3: Process addons and ingredient continuations
    if (currentSandwich && currentSection) {
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

      if (couldBeNewSandwich && nextLineHasIngredients) {
        sandwiches.push(currentSandwich)

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

        i = j - 1
        continue
      }

      const addonMatch =
        line.match(/(?:Add|add)\s+(.+)/i) ||
        line.match(/^\+(.+)/) ||
        line.match(/^\+?\s*(?:Add|add)\s+(.+)/i) ||
        line.match(/deluxe.*(?:Add|add)\s+(.+)/i) ||
        line.match(/deluxe\s*:\s*(?:Add|add)\s+(.+)/i)

      if (addonMatch) {
        let addonName = addonMatch[1]
          .trim()
          .replace(/^add\s+/i, '')
          .replace(/^option:\s*/i, '')
          .trim()

        if (addonName && addonName.length > 0 && !currentSandwich.addons.includes(addonName)) {
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

// Test all menus
const menus = [
  { name: 'Wednesday', text: menu1 },
  { name: 'Thursday', text: menu2 },
  { name: 'Friday', text: menu3 },
  { name: 'Saturday', text: menu4 }
]

console.log('='.repeat(70))
console.log('TESTING ALL MENUS')
console.log('='.repeat(70))
console.log()

let totalPassed = 0
let totalFailed = 0

menus.forEach((menu, idx) => {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`MENU ${idx + 1}: ${menu.name}`)
  console.log('='.repeat(70))

  const result = parseMenuText(menu.text)

  const hoagies = result.filter(s => s.type === 'Hoagie')
  const focaccia = result.filter(s => s.type === 'Focaccia')

  console.log(`\nResults:`)
  console.log(`  Hoagies: ${hoagies.length}`)
  hoagies.forEach(s => {
    console.log(`    - ${s.name}${s.addons.length > 0 ? ` (addons: ${s.addons.join(', ')})` : ''}`)
  })

  console.log(`\n  Focaccia: ${focaccia.length}`)
  focaccia.forEach(s => {
    console.log(`    - ${s.name}${s.addons.length > 0 ? ` (addons: ${s.addons.join(', ')})` : ''}`)
  })

  // Basic validation
  if (hoagies.length > 0 && focaccia.length > 0) {
    console.log(`\n  ✓ Menu parsed successfully`)
    totalPassed++
  } else {
    console.log(`\n  ✗ Menu parsing failed`)
    totalFailed++
  }
})

console.log(`\n${'='.repeat(70)}`)
console.log(`SUMMARY: ${totalPassed} passed, ${totalFailed} failed`)
console.log('='.repeat(70))
