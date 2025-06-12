// ANCHOR: coffee-order-flow-component
import { useState } from 'react'
import { addCoffeeOrder } from '../db/database.js'

function CoffeeOrderFlow({ onBack }) {
  const [step, setStep] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [selectedCoffee, setSelectedCoffee] = useState(null)
  const [milkType, setMilkType] = useState('none')
  const [drinkBase, setDrinkBase] = useState('coffee')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const coffeeTypes = [
    { id: 'cappuccino', name: 'Cappuccino', price: 4.50 },
    { id: 'cortado', name: 'Cortado', price: 4.25 },
    { id: 'flat-white', name: 'Flat White', price: 4.75 },
    { id: 'latte', name: 'Latte', price: 4.50, hasBaseOption: true },
    { id: 'strawberry-latte', name: 'Strawberry Latte', price: 5.50, hasBaseOption: true },
    { id: 'hot-chocolate', name: 'Hot Chocolate', price: 4.00 },
    { id: 'drip-coffee', name: 'Drip Coffee', price: 3.50 },
    { id: 'pour-over', name: 'Pour Over', price: 5.00 },
    { id: 'tea', name: 'Tea', price: 3.00 }
  ]

  const handleSubmitOrder = async () => {
    if (!customerName.trim() || !selectedCoffee) return

    setIsSubmitting(true)
    try {
      let drinkName = selectedCoffee.name
      if (selectedCoffee.hasBaseOption) {
        drinkName = `${drinkBase === 'coffee' ? 'Coffee' : 'Matcha'} ${selectedCoffee.name}`
      }
      await addCoffeeOrder(customerName.trim(), drinkName, milkType, notes)
      setStep(3)
    } catch (error) {
      console.error('Error submitting coffee order:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setCustomerName('')
    setSelectedCoffee(null)
    setMilkType('none')
    setDrinkBase('coffee')
    setNotes('')
  }

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              ← Back
            </button>
            <div className="text-2xl">☕</div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Coffee Order
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                autoFocus
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!customerName.trim()}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-slate-900
                disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg
                transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              ← Back
            </button>
            <div className="text-2xl">☕</div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Choose Your Coffee
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Hello {customerName}! Select your drink and milk preference.
          </p>

          {/* Milk Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {/* Show Black option only for drip coffee, tea, and pour over */}
              {selectedCoffee && ['drip-coffee', 'tea', 'pour-over'].includes(selectedCoffee.id) && (
                <button
                  onClick={() => setMilkType('none')}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    milkType === 'none'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Black
                </button>
              )}
              <button
                onClick={() => setMilkType('oat')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                  milkType === 'oat'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Oat
              </button>
              <button
                onClick={() => setMilkType('cow')}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                  milkType === 'cow'
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Dairy
              </button>
            </div>
          </div>

          {/* Coffee Menu */}
          <div className="grid gap-3 mb-6">
            {coffeeTypes.map((coffee) => (
              <div key={coffee.id} className={`border rounded-lg transition-all duration-200 ${
                selectedCoffee?.id === coffee.id
                  ? 'border-blue-800 bg-blue-50 shadow-md'
                  : 'border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setSelectedCoffee(coffee);
                    // If switching to a drink that doesn't support "No Milk" and currently "none" is selected, switch to oat
                    if (milkType === 'none' && !['drip-coffee', 'tea', 'pour-over'].includes(coffee.id)) {
                      setMilkType('oat');
                    }
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{coffee.name}</h3>
                          <p className="text-blue-800 font-medium">${coffee.price.toFixed(2)}</p>
                        </div>
                        {/* Drink Base Options - show inline if this drink has base options and is selected */}
                        {coffee.hasBaseOption && selectedCoffee?.id === coffee.id && (
                          <div className="ml-4 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrinkBase('coffee');
                              }}
                              className={`px-2 py-1 rounded-md transition-all duration-200 text-xs ${
                                drinkBase === 'coffee'
                                  ? 'bg-blue-800 text-white shadow-md'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Coffee
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrinkBase('matcha');
                              }}
                              className={`px-2 py-1 rounded-md transition-all duration-200 text-xs ${
                                drinkBase === 'matcha'
                                  ? 'bg-blue-800 text-white shadow-md'
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Matcha
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedCoffee?.id === coffee.id && (
                        <span className="text-blue-600 text-lg font-semibold">✓ Selected</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions / Allergies (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-none"
                rows="3"
                placeholder="Any special requests or allergy information..."
              />
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={!selectedCoffee || isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg
                transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you {customerName}! Your coffee order has been received.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedCoffee.hasBaseOption
                    ? `${drinkBase === 'coffee' ? 'Coffee' : 'Matcha'} ${selectedCoffee.name}`
                    : selectedCoffee.name
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {milkType === 'none' ? 'Black' : `with ${milkType === 'oat' ? 'Oat' : 'Dairy'}`}
                </p>
                {notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Notes:</strong> {notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-800">${selectedCoffee.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-slate-900
                text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Place Another Order
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg
                transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default CoffeeOrderFlow
