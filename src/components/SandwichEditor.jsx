import { useState, useEffect } from 'react'
import { getAllSandwiches, addSandwich, updateSandwich } from '../db/database.js'

// ANCHOR: sandwich-editor-component
function SandwichEditor({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [sandwiches, setSandwiches] = useState([])
  const [editingSandwich, setEditingSandwich] = useState(null)
  const [showForm, setShowForm] = useState(false)
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

  const loadSandwiches = async () => {
    try {
      const allSandwiches = await getAllSandwiches()
      setSandwiches(allSandwiches)
    } catch (error) {
      alert('Error loading sandwiches: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    try {
      if (editingSandwich) {
        await updateSandwich(editingSandwich.id, formData.name, formData.type, formData.ingredients, price)
        alert(`✅ Successfully updated "${formData.name}"!`)
      } else {
        await addSandwich(formData.name, formData.type, formData.ingredients, price)
        alert(`✅ Successfully added "${formData.name}" to the menu!`)
      }

      await loadSandwiches()
      resetForm()
    } catch (error) {
      console.error('Error saving sandwich:', error)
      alert('Error saving sandwich: ' + error.message)
    }
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
    // Prevent scroll to top
    window.scrollTo({ top: window.scrollY, behavior: 'instant' })
  }

  // Removed delete functionality - sandwiches are kept in library for historical reference
  // Use "Manage Weekly Menu" to control which sandwiches appear on the menu

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordInput === 'sandwhich') {
      setIsAuthenticated(true)
      setPasswordInput('')
    } else {
      alert('Incorrect password')
      setPasswordInput('')
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl mb-4">
              <span className="text-white text-xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Required</h2>
            <p className="text-gray-600">Enter the password to access the sandwich editor</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Access Editor
              </button>
              <button
                type="button"
                onClick={onBack}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Sandwich Library</h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowForm(true)
              // Prevent scroll to top
              window.scrollTo({ top: window.scrollY, behavior: 'instant' })
            }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Add New Sandwich</span>
          </button>
          <button
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Edit/Add Modal */}
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
                  {editingSandwich ? 'Edit Sandwich' : 'Add New Sandwich to Library'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {editingSandwich ? 'Update the sandwich details below' : 'Add this sandwich to your library. Use "Manage Weekly Menu" to add it to this week\'s menu.'}
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

      <div className="space-y-6">
        {sortedTypes.map((type) => {
          const typeSandwiches = groupedSandwiches[type]
          return (
          <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <h3 className="text-xl font-bold text-gray-800">{type} Sandwiches</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {typeSandwiches.length} item{typeSandwiches.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4">
              {typeSandwiches.map((sandwich) => (
                <div key={sandwich.id} className="group bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                    <div className="flex-1 sm:mr-4">
                      <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{sandwich.name}</h4>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">{sandwich.ingredients}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-emerald-600 font-bold text-lg">${sandwich.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{type}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEdit(sandwich)
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {typeSandwiches.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <p className="text-gray-500">No {type.toLowerCase()} sandwiches yet</p>
                <p className="text-gray-400 text-sm">Add your first {type.toLowerCase()} sandwich above!</p>
              </div>
            )}
          </div>
          )
        })}

        {Object.keys(groupedSandwiches).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-8xl mb-6">🥪</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No sandwiches yet!</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first sandwich to the menu.</p>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowForm(true)
                window.scrollTo({ top: window.scrollY, behavior: 'instant' })
              }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Add Your First Sandwich
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SandwichEditor
