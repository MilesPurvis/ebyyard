import { useState, useEffect } from 'react'
import { getAllSandwiches, addSandwich, updateSandwich, deleteSandwich } from '../db/database.js'

// ANCHOR: sandwich-editor-component
function SandwichEditor({ onBack }) {
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

  const loadSandwiches = () => {
    const allSandwiches = getAllSandwiches()
    setSandwiches(allSandwiches)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    try {
      if (editingSandwich) {
        updateSandwich(editingSandwich.id, formData.name, formData.type, formData.ingredients, price)
      } else {
        addSandwich(formData.name, formData.type, formData.ingredients, price)
      }

      loadSandwiches()
      resetForm()
    } catch (error) {
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
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sandwich?')) {
      try {
        deleteSandwich(id)
        loadSandwiches()
      } catch (error) {
        alert('Error deleting sandwich: ' + error.message)
      }
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Menu</h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowForm(true)}
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

      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4">
              <span className="text-white text-xl">{editingSandwich ? '✏️' : '➕'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {editingSandwich ? 'Edit Sandwich' : 'Add New Sandwich'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {editingSandwich ? 'Update the sandwich details below' : 'Fill in the details for your new sandwich'}
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
      )}

      <div className="space-y-6">
        {Object.entries(groupedSandwiches).map(([type, typeSandwiches]) => (
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
                    <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
                      <button
                        onClick={() => handleEdit(sandwich)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(sandwich.id)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
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
        ))}

        {Object.keys(groupedSandwiches).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-8xl mb-6">🥪</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No sandwiches yet!</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first sandwich to the menu.</p>
            <button
              onClick={() => setShowForm(true)}
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
