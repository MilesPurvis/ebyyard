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
      alert(`Failed to submit order: ${error.message}. Please try again.`)
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
            Hello {customerName}! Select your drink below.
          </p>

          {/* Coffee Menu */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Choose Your Drink</h3>
            <div className="grid gap-3">
              {coffeeTypes.map((coffee) => (
                <div key={coffee.id}>
                  <div className={`border-2 rounded-xl transition-all duration-200 ${
                    selectedCoffee?.id === coffee.id
                      ? 'border-blue-800 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <button
                      onClick={() => {
                        setSelectedCoffee(coffee);
                        // Auto-switch milk for drinks that MUST have milk
                        if (milkType === 'none' && !['drip-coffee', 'tea', 'pour-over'].includes(coffee.id)) {
                          setMilkType('oat milk');
                        }
                      }}
                      className="w-full p-4 text-left rounded-xl transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">{coffee.name}</h3>
                            </div>
                            {selectedCoffee?.id === coffee.id && (
                              <div className="text-blue-600 text-2xl">✓</div>
                            )}
                          </div>
                          {coffee.hasBaseOption && (
                            <p className="text-sm text-gray-600 mt-1">
                              Available in Coffee or Matcha base
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Show options right below the selected drink */}
                  {selectedCoffee?.id === coffee.id && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      {/* Base Selection for Lattes */}
                      {coffee.hasBaseOption && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-3 text-center">Choose Your Base</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setDrinkBase('coffee')}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                                drinkBase === 'coffee'
                                  ? 'border-amber-600 bg-amber-600 text-white shadow-lg'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                              }`}
                            >
                              ☕ Coffee Base
                            </button>
                            <button
                              onClick={() => setDrinkBase('matcha')}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                                drinkBase === 'matcha'
                                  ? 'border-green-600 bg-green-600 text-white shadow-lg'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                              }`}
                            >
                              🍵 Matcha Base
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Milk Selection */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 text-center">Choose Your Milk</h4>
                        <div className={`grid gap-2 ${['drip-coffee', 'tea', 'pour-over'].includes(coffee.id) ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          {/* Only show Black option for tea, drip coffee, and pour over */}
                          {['drip-coffee', 'tea', 'pour-over'].includes(coffee.id) && (
                            <button
                              onClick={() => setMilkType('none')}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                                milkType === 'none'
                                  ? 'border-gray-700 bg-gray-700 text-white shadow-lg'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              ☕ Black
                            </button>
                          )}
                          <button
                            onClick={() => setMilkType('oat milk')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                              milkType === 'oat milk'
                                ? 'border-blue-800 bg-blue-800 text-white shadow-lg'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            🌾 Oat
                          </button>
                          <button
                            onClick={() => setMilkType('dairy milk')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                              milkType === 'dairy milk'
                                ? 'border-blue-800 bg-blue-800 text-white shadow-lg'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            🥛 Dairy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedCoffee && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2 text-center">Your Order</h4>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">
                  {selectedCoffee.hasBaseOption
                    ? `${drinkBase === 'coffee' ? 'Coffee' : 'Matcha'} ${selectedCoffee.name}`
                    : selectedCoffee.name
                  }
                </p>
                <p className="text-sm text-gray-600">
                  with {milkType === 'none' ? 'black (no milk)' : milkType}
                </p>
              </div>
            </div>
          )}

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
