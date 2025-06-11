import { useState, useEffect } from 'react'
import { getAllSandwiches, addOrder } from '../db/database.js'

// ANCHOR: order-flow-component
function OrderFlow({ onBack }) {
  const [step, setStep] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [selectedSandwich, setSelectedSandwich] = useState(null)
  const [notes, setNotes] = useState('')
  const [sandwiches, setSandwiches] = useState([])

  useEffect(() => {
    const loadSandwiches = async () => {
      try {
        const allSandwiches = await getAllSandwiches()
        setSandwiches(allSandwiches)
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
    setStep(3)
  }

  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    try {
      await addOrder(customerName, selectedSandwich.id, notes)
      setStep(4)
    } catch (error) {
      alert('Error placing order: ' + error.message)
    }
  }

  const resetOrder = () => {
    setStep(1)
    setCustomerName('')
    setSelectedSandwich(null)
    setNotes('')
  }

  const groupedSandwiches = sandwiches.reduce((acc, sandwich) => {
    if (!acc[sandwich.type]) {
      acc[sandwich.type] = []
    }
    acc[sandwich.type].push(sandwich)
    return acc
  }, {})

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
            {Object.entries(groupedSandwiches).map(([type, typeSandwiches]) => (
              <div key={type}>
                <div className="flex items-center space-x-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-800">{type}</h4>
                </div>
                <div className="grid gap-3">
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
            ))}
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 3: Final Details</h3>
            <p className="text-gray-600 text-sm sm:text-base">Review your order and add any special notes</p>
          </div>

          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>Order Summary</span>
            </h4>
            <div className="space-y-2 text-sm sm:text-base">
              <p className="text-gray-700"><span className="font-medium">Customer:</span> {customerName}</p>
              <p className="text-gray-700"><span className="font-medium">Sandwich:</span> {selectedSandwich.name}</p>
              <p className="text-gray-700"><span className="font-medium">Ingredients:</span> {selectedSandwich.ingredients}</p>
              <div className="pt-2 border-t border-blue-200">
                <p className="text-emerald-600 font-bold text-lg">Total: ${selectedSandwich.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleOrderSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <span>💬</span>
                <span>Special Notes (allergies, preferences, etc.)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 text-base"
                rows="4"
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
              onClick={resetOrder}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>🍽️</span>
              <span>Place Another Order</span>
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
