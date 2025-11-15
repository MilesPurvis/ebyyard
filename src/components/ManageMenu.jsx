import { useState, useEffect, useRef } from 'react'
import { getAllSandwiches, toggleSandwichActive, setAllSandwichesInactive, addSandwich, updateSandwich } from '../db/database.js'

// ANCHOR: manage-menu-component
function ManageMenu({ onBack }) {
  const [sandwiches, setSandwiches] = useState([])
  const [loading, setLoading] = useState(false)
  const mondayCheckDone = useRef(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSandwich, setEditingSandwich] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Focaccia',
    ingredients: '',
    price: '',
    addons: []
  })

  useEffect(() => {
    loadSandwiches()
  }, [])

  // Auto-clear menu on Mondays
  useEffect(() => {
    const checkAndClearMondayMenu = async () => {
      // Skip if we've already checked this session
      if (mondayCheckDone.current) return

      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const todayDateString = today.toDateString()

      // Check if it's Monday (day 1)
      if (dayOfWeek === 1) {
        // Check if we've already cleared today
        const lastClearedDate = localStorage.getItem('menuLastCleared')

        if (lastClearedDate !== todayDateString) {
          // Check if there are any active sandwiches
          const hasActiveSandwiches = sandwiches.some(s => s.is_active)

          if (hasActiveSandwiches) {
            try {
              mondayCheckDone.current = true // Mark as checked to prevent re-runs
              await setAllSandwichesInactive()
              localStorage.setItem('menuLastCleared', todayDateString)
              // Reload sandwiches to reflect the change
              await loadSandwiches()
              // Show a subtle notification (optional - you can remove if too intrusive)
              console.log('✅ Weekly menu automatically cleared (Monday reset)')
            } catch (error) {
              console.error('Error auto-clearing menu:', error)
              mondayCheckDone.current = false // Reset on error so it can retry
            }
          } else {
            // No active sandwiches, mark as checked anyway
            mondayCheckDone.current = true
          }
        } else {
          // Already cleared today, mark as checked
          mondayCheckDone.current = true
        }
      } else {
        // Not Monday, mark as checked
        mondayCheckDone.current = true
      }
    }

    // Only run if we have sandwiches loaded and haven't checked yet
    if (sandwiches.length > 0 && !loading && !mondayCheckDone.current) {
      checkAndClearMondayMenu()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandwiches.length, loading]) // Run when sandwiches are loaded

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [showForm])

  const loadSandwiches = async (preserveScroll = false) => {
    const scrollY = window.scrollY
    setLoading(true)
    try {
      const allSandwiches = await getAllSandwiches()
      setSandwiches(allSandwiches)
      // Restore scroll position if requested
      if (preserveScroll) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' })
        })
      }
    } catch (error) {
      alert('Error loading sandwiches: ' + error.message)
      if (preserveScroll) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' })
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id, currentStatus, type) => {

    // Check limits before toggling
    const activeByType = sandwiches.filter(s => s.is_active && s.type === type).length

    if (!currentStatus) {
      // Trying to activate
      if (type === 'Hoagie' && activeByType >= 4) {
        alert('Maximum 4 Hoagies allowed on the menu')
        return
      }
      if (type === 'Focaccia' && activeByType >= 4) {
        alert('Maximum 4 Focaccia allowed on the menu')
        return
      }
    }

    // Optimistic update - update UI immediately
    setSandwiches(prevSandwiches =>
      prevSandwiches.map(s =>
        s.id === id ? { ...s, is_active: !currentStatus } : s
      )
    )

    try {
      await toggleSandwichActive(id, !currentStatus)
      // Don't reload - optimistic update is sufficient
      // Only reload if there's an error to revert
    } catch (error) {
      // Revert optimistic update on error
      setSandwiches(prevSandwiches =>
        prevSandwiches.map(s =>
          s.id === id ? { ...s, is_active: currentStatus } : s
        )
      )
      alert('Error updating sandwich: ' + error.message)
    }
  }

  const handleAddNew = () => {
    setEditingSandwich(null)
    setFormData({
      name: '',
      type: 'Focaccia',
      ingredients: '',
      price: '',
      addons: []
    })
    setShowForm(true)
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
  }

  const handleEdit = (sandwich) => {
    setEditingSandwich(sandwich)
    setFormData({
      name: sandwich.name,
      type: sandwich.type,
      ingredients: sandwich.ingredients,
      price: sandwich.price.toString(),
      addons: sandwich.addons || []
    })
    setShowForm(true)
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
  }

  const handleAddAddon = () => {
    setFormData({
      ...formData,
      addons: [...formData.addons, { name: '', price: '' }]
    })
  }

  const handleRemoveAddon = (index) => {
    setFormData({
      ...formData,
      addons: formData.addons.filter((_, i) => i !== index)
    })
  }

  const handleUpdateAddon = (index, field, value) => {
    const updatedAddons = [...formData.addons]
    updatedAddons[index] = { ...updatedAddons[index], [field]: value }
    setFormData({ ...formData, addons: updatedAddons })
  }

  const handleClearAll = async () => {
    const scrollY = window.scrollY
    if (window.confirm('Clear all sandwiches from this week\'s menu? This will make all sandwiches inactive.')) {
      try {
        await setAllSandwichesInactive()
        await loadSandwiches(true)
        alert('✅ Weekly menu cleared!')
      } catch (error) {
        alert('Error clearing menu: ' + error.message)
        await loadSandwiches(true)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    // Validate and process addons
    const processedAddons = formData.addons
      .filter(addon => addon.name.trim() && addon.price)
      .map(addon => ({
        name: addon.name.trim(),
        price: parseFloat(addon.price)
      }))
      .filter(addon => !isNaN(addon.price) && addon.price > 0)

    try {
      if (editingSandwich) {
        await updateSandwich(editingSandwich.id, formData.name, formData.type, formData.ingredients, price, processedAddons)
        alert(`✅ Successfully updated "${formData.name}"!`)
      } else {
        // Check if menu is full for this type - if so, add as inactive
        const activeByType = sandwiches.filter(s => s.is_active && s.type === formData.type).length
        const isMenuFull = (formData.type === 'Hoagie' && activeByType >= 4) ||
                          (formData.type === 'Focaccia' && activeByType >= 4)
        const shouldActivate = !isMenuFull

        await addSandwich(formData.name, formData.type, formData.ingredients, price, shouldActivate, processedAddons)

        if (isMenuFull) {
          alert(`✅ Successfully added "${formData.name}"! (Added as inactive - menu is full. Activate it manually when ready.)`)
        } else {
          alert(`✅ Successfully added "${formData.name}" to the menu!`)
        }
      }

      await loadSandwiches()
      resetForm()
    } catch (error) {
      console.error('Error saving sandwich:', error)
      alert('Error saving sandwich: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Focaccia',
      ingredients: '',
      price: '',
      addons: []
    })
    setEditingSandwich(null)
    setShowForm(false)
  }

  const activeHoagies = sandwiches.filter(s => s.is_active && s.type === 'Hoagie').length
  const activeFocaccia = sandwiches.filter(s => s.is_active && s.type === 'Focaccia').length

  const groupedSandwiches = sandwiches.reduce((acc, sandwich) => {
    if (!acc[sandwich.type]) {
      acc[sandwich.type] = []
    }
    acc[sandwich.type].push(sandwich)
    return acc
  }, {})

  // Sort types so Hoagie appears before Focaccia
  const sortedTypes = Object.keys(groupedSandwiches).sort((a, b) => {
    if (a === 'Hoagie' && b !== 'Hoagie') return -1
    if (b === 'Hoagie' && a !== 'Hoagie') return 1
    return a.localeCompare(b)
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Menu</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-sm"
          >
            ← Back
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg font-medium text-xs">
              {activeHoagies}/4 Hoagies
            </span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg font-medium text-xs">
              {activeFocaccia}/4 Focaccia
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 text-xs font-medium"
            >
              <span>➕</span>
              <span>Add New</span>
            </button>
            <button
              onClick={handleClearAll}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 text-xs font-medium"
            >
              <span>🗑️</span>
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-3 text-sm">Loading sandwiches...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTypes.map((type) => {
            const typeSandwiches = groupedSandwiches[type]
            const activeCount = typeSandwiches.filter(s => s.is_active).length
            const maxCount = 4
            const isAtLimit = activeCount >= maxCount

            return (
              <div key={type} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-gray-800">{type} Sandwiches</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isAtLimit
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {activeCount} / {maxCount} active
                    </span>
                  </div>
                  {isAtLimit && (
                    <span className="text-xs text-red-600 font-medium">Limit reached</span>
                  )}
                </div>

                <div className="space-y-3">
                  {typeSandwiches.map((sandwich) => (
                    <div
                      key={sandwich.id}
                      className={`group bg-white/60 backdrop-blur-sm border rounded-lg p-3 transition-all duration-300 ${
                        sandwich.is_active
                          ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 hover:shadow-md'
                          : 'border-gray-200 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1.5">
                            <h4 className="font-bold text-base text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
                              {sandwich.name}
                            </h4>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">{sandwich.ingredients}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold text-base">${sandwich.price.toFixed(2)}</span>
                            {sandwich.is_active && (
                              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                ON MENU
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEdit(sandwich)
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleToggle(sandwich.id, sandwich.is_active, sandwich.type)
                            }}
                            disabled={!sandwich.is_active && isAtLimit}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-1 ${
                              sandwich.is_active
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                : isAtLimit
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                            }`}
                          >
                            <span>{sandwich.is_active ? '−' : '+'}</span>
                            <span>{sandwich.is_active ? 'Remove' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {typeSandwiches.length === 0 && (
                  <div className="text-center py-6">
                    <div className="text-gray-400 text-4xl mb-2">🍽️</div>
                    <p className="text-gray-500 text-sm">No {type.toLowerCase()} sandwiches yet</p>
                    <p className="text-gray-400 text-xs">Add your first {type.toLowerCase()} sandwich above!</p>
                  </div>
                )}
              </div>
            )
          })}

          {Object.keys(groupedSandwiches).length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🥪</div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">No sandwiches yet!</h3>
              <p className="text-gray-500 mb-4 text-sm">Get started by adding your first sandwich to the menu.</p>
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Add Your First Sandwich
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={resetForm}
          style={{ scrollBehavior: 'auto' }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingSandwich ? '✏️ Edit Sandwich' : '➕ Add New Sandwich'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sandwich Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      placeholder="e.g., Margherita Focaccia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    >
                      <option value="Focaccia">Focaccia</option>
                      <option value="Hoagie">Hoagie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ingredients
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="List all ingredients separated by commas..."
                    required
                  />
                </div>

                <div className="md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Base Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      placeholder="12.99"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Optional Addons
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAddon}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                    >
                      <span>➕</span>
                      <span>Add Addon</span>
                    </button>
                  </div>
                  {formData.addons.length > 0 && (
                    <div className="space-y-2">
                      {formData.addons.map((addon, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => handleUpdateAddon(index, 'name', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            placeholder="Addon name (e.g., Bacon)"
                          />
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={addon.price}
                              onChange={(e) => handleUpdateAddon(index, 'price', e.target.value)}
                              className="w-full pl-6 pr-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              placeholder="2.00"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(index)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.addons.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No addons added. Click "Add Addon" to add optional extras.</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>{editingSandwich ? '✏️' : '➕'}</span>
                    <span>{editingSandwich ? 'Update' : 'Add'} Sandwich</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>✕</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageMenu
