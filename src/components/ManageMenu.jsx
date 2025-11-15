import { useState, useEffect } from 'react'
import { getAllSandwiches, toggleSandwichActive, setAllSandwichesInactive, addSandwich, updateSandwich } from '../db/database.js'

// ANCHOR: manage-menu-component
function ManageMenu({ onBack }) {
  const [sandwiches, setSandwiches] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSandwich, setEditingSandwich] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Focaccia',
    ingredients: '',
    price: ''
  })

  useEffect(() => {
    loadSandwiches()
  }, [])

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
    // Prevent scroll to top
    const scrollY = window.scrollY

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
      price: ''
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
      price: sandwich.price.toString()
    })
    setShowForm(true)
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
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

    // Check limits when adding new sandwich (if marking as active)
    if (!editingSandwich) {
      const activeByType = sandwiches.filter(s => s.is_active && s.type === formData.type).length
      if (formData.type === 'Hoagie' && activeByType >= 4) {
        alert('Maximum 4 Hoagies allowed on the menu. Please deactivate one first.')
        return
      }
      if (formData.type === 'Focaccia' && activeByType >= 4) {
        alert('Maximum 4 Focaccia allowed on the menu. Please deactivate one first.')
        return
      }
    }

    try {
      if (editingSandwich) {
        await updateSandwich(editingSandwich.id, formData.name, formData.type, formData.ingredients, price)
        alert(`✅ Successfully updated "${formData.name}"!`)
      } else {
        // Add new sandwich and mark as active
        await addSandwich(formData.name, formData.type, formData.ingredients, price, true)
        alert(`✅ Successfully added "${formData.name}" to the menu!`)
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
      price: ''
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
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4">
                  <span className="text-white text-xl">{editingSandwich ? '✏️' : '➕'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {editingSandwich ? 'Edit Sandwich' : 'Add New Sandwich'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {editingSandwich ? 'Update the sandwich details below' : 'Add this sandwich to your menu. It will be automatically marked as active.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sandwich Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      placeholder="e.g., Margherita Focaccia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    >
                      <option value="Focaccia">Focaccia</option>
                      <option value="Hoagie">Hoagie</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ingredients
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    rows="4"
                    placeholder="List all ingredients separated by commas..."
                    required
                  />
                </div>

                <div className="md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      placeholder="12.99"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>{editingSandwich ? '✏️' : '➕'}</span>
                    <span>{editingSandwich ? 'Update' : 'Add'} Sandwich</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
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
