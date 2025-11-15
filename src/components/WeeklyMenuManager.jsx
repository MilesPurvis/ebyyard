import { useState, useEffect } from 'react'
import { getAllSandwiches, toggleSandwichActive, setAllSandwichesInactive } from '../db/database.js'

// ANCHOR: weekly-menu-manager-component
function WeeklyMenuManager({ onBack }) {
  const [sandwiches, setSandwiches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSandwiches()
  }, [])

  const loadSandwiches = async () => {
    setLoading(true)
    try {
      const allSandwiches = await getAllSandwiches()
      setSandwiches(allSandwiches)
    } catch (error) {
      alert('Error loading sandwiches: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleSandwichActive(id, !currentStatus)
      await loadSandwiches()
    } catch (error) {
      alert('Error updating sandwich: ' + error.message)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Clear all sandwiches from this week\'s menu? This will make all sandwiches inactive.')) {
      try {
        await setAllSandwichesInactive()
        await loadSandwiches()
        alert('✅ Weekly menu cleared!')
      } catch (error) {
        alert('Error clearing menu: ' + error.message)
      }
    }
  }

  const activeCount = sandwiches.filter(s => s.is_active).length
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Weekly Menu</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {activeCount} active
          </span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleClearAll}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🗑️</span>
            <span>Clear All</span>
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

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl mb-4">
            <span className="text-white text-xl">📅</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Select This Week's Menu</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Toggle sandwiches on/off for this week. Only active sandwiches will appear when customers place orders.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading sandwiches...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTypes.map((type) => {
            const typeSandwiches = groupedSandwiches[type]
            return (
            <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <h3 className="text-xl font-bold text-gray-800">{type} Sandwiches</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {typeSandwiches.filter(s => s.is_active).length} / {typeSandwiches.length} active
                </span>
              </div>

              <div className="grid gap-4">
                {typeSandwiches.map((sandwich) => (
                  <div
                    key={sandwich.id}
                    className={`group bg-white/60 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
                      sandwich.is_active
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 hover:shadow-lg'
                        : 'border-gray-200 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div className="flex-1 sm:mr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-lg text-gray-800 group-hover:text-emerald-600 transition-colors duration-200">
                            {sandwich.name}
                          </h4>
                          {sandwich.is_active && (
                            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              ON MENU
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{sandwich.ingredients}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-emerald-600 font-bold text-lg">${sandwich.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{type}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggle(sandwich.id, sandwich.is_active)}
                          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 ${
                            sandwich.is_active
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                          }`}
                        >
                          <span>{sandwich.is_active ? '❌' : '✅'}</span>
                          <span>{sandwich.is_active ? 'Remove' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {typeSandwiches.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                  <p className="text-gray-500">No {type.toLowerCase()} sandwiches in library yet</p>
                  <p className="text-gray-400 text-sm">Add sandwiches in "Edit Sandwich Library" first</p>
                </div>
              )}
            </div>
          )
          })}

          {Object.keys(groupedSandwiches).length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-8xl mb-6">🥪</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No sandwiches in library yet!</h3>
              <p className="text-gray-500 mb-6">Add sandwiches to your library first, then come back here to select them for the weekly menu.</p>
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Edit Sandwich Library
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WeeklyMenuManager
