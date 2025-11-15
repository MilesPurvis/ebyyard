import { useState, useEffect } from 'react'
import { getActiveSandwiches, addOrder } from '../db/database.js'

// ANCHOR: order-flow-component
function OrderFlow({ onBack, onNavigate }) {
  const [step, setStep] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [selectedSandwich, setSelectedSandwich] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [cookieQuantity, setCookieQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [sandwiches, setSandwiches] = useState([])

  useEffect(() => {
    const loadSandwiches = async () => {
      try {
        const activeSandwiches = await getActiveSandwiches()
        setSandwiches(activeSandwiches)
      } catch (error) {
        alert('Error loading sandwiches: ' + error.message)
      }
    }
    loadSandwiches()
  }, [])

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (customerName.trim()) {
      setStep(2)
    }
  }

  const handleSandwichSelect = (sandwich) => {
    setSelectedSandwich(sandwich)
    setSelectedAddons([]) // Reset addons when selecting a new sandwich
    setStep(3)
  }

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.some(a => a.name === addon.name)
      if (isSelected) {
        return prev.filter(a => a.name !== addon.name)
      } else {
        return [...prev, addon]
      }
    })
  }

  const calculateSubtotal = () => {
    if (!selectedSandwich) return 0
    const basePrice = selectedSandwich.price || 0
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
    const cookiesPrice = cookieQuantity * 4
    return basePrice + addonsPrice + cookiesPrice
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.13 // 13% tax
  }

  const calculateTotalPrice = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    try {
      await addOrder(customerName, selectedSandwich.id, notes, selectedAddons, cookieQuantity)
      setStep(4)
    } catch (error) {
      alert('Error placing order: ' + error.message)
    }
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Place Order</h2>
        </div>
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </div>

      {step === 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4">
              <span className="text-white text-xl">👤</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 1: Who's Ordering?</h3>
            <p className="text-gray-600 text-sm sm:text-base">Let's start with your name</p>
          </div>
          <form onSubmit={handleNameSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 text-base"
                placeholder="Enter your name here..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue →
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 2: Choose Your Sandwich</h3>
            <p className="text-gray-600 text-sm sm:text-base">👋 Hi {customerName}! </p>
          </div>

          <div className="space-y-6">
            {sortedTypes.map((type) => {
              const typeSandwiches = groupedSandwiches[type]
              return (
              <div key={type}>
                <div className="flex items-center space-x-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-800">{type}</h4>
                </div>
                <div className="space-y-3">
                  {typeSandwiches.map((sandwich) => (
                    <button
                      key={sandwich.id}
                      onClick={() => handleSandwichSelect(sandwich)}
                      className="group w-full text-left p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <h5 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{sandwich.name}</h5>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{sandwich.ingredients}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-emerald-600 font-bold text-lg">${sandwich.price.toFixed(2)}</span>
                          <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">Select →</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )
            })}
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-6 w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl mb-4">
              <span className="text-white text-xl">📝</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 3: Customize Your Order</h3>
            <p className="text-gray-600 text-sm sm:text-base">Add extras and review your order</p>
          </div>

          {/* Sandwich Card with Addons */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
            <div className="mb-4">
              <h4 className="font-bold text-lg text-gray-800 mb-1">{selectedSandwich.name}</h4>
              <p className="text-sm text-gray-600">{selectedSandwich.ingredients}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-emerald-600 font-semibold">Base: ${selectedSandwich.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Addons - Integrated with Sandwich */}
            {selectedSandwich.addons && selectedSandwich.addons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add to your sandwich:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSandwich.addons.map((addon, index) => {
                    const isSelected = selectedAddons.some(a => a.name === addon.name)
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddonToggle(addon)}
                        className={`text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="font-medium text-sm text-gray-800">{addon.name}</span>
                          </div>
                          <span className="text-emerald-600 font-semibold text-sm">+${addon.price.toFixed(2)}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>📋</span>
              <span>Order Summary</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (13%):</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-emerald-300 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total (tax included):</span>
                  <span className="text-emerald-600 font-bold text-xl">${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies Selection */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🍪</span>
                <div>
                  <span className="text-sm font-semibold text-gray-800">Cookies</span>
                  <span className="text-xs text-gray-600 ml-2">$4.00 each</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`font-semibold text-sm min-w-[3.5rem] text-left ${cookieQuantity > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  ${(cookieQuantity * 4).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setCookieQuantity(Math.max(0, cookieQuantity - 1))}
                  disabled={cookieQuantity === 0}
                  className="w-9 h-9 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700 transition-all duration-200 hover:border-gray-400"
                >
                  −
                </button>
                <span className="text-lg font-bold text-gray-800 min-w-[2rem] text-center">{cookieQuantity}</span>
                <button
                  type="button"
                  onClick={() => setCookieQuantity(cookieQuantity + 1)}
                  className="w-9 h-9 rounded-lg border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 flex items-center justify-center font-bold text-amber-700 transition-all duration-200 hover:border-amber-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleOrderSubmit}>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <span>💬</span>
                <span>Special Notes (allergies, preferences, etc.)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 text-base"
                rows="3"
                placeholder="Any special requests or allergy information... (optional)"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>✅</span>
                <span>Confirm Order</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-4 animate-bounce">
              <span className="text-white text-3xl">✅</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Order Confirmed! 🎉</h3>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-6 border border-emerald-200">
            <p className="text-gray-700 text-sm sm:text-base">
              Thanks <span className="font-bold text-emerald-600">{customerName}</span>! Your order for <span className="font-bold">{selectedSandwich.name}</span> has been placed successfully.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onNavigate ? onNavigate('print') : onBack()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>View Orders</span>
            </button>
            <button
              onClick={onBack}
              className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl transition-all duration-200 border border-gray-200 flex items-center justify-center space-x-2"
            >
              <span>🏠</span>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderFlow
