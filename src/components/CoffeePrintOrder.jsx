// ANCHOR: coffee-print-order-component
import { useState, useEffect } from 'react'
import { getTodaysCoffeeOrders, getTodaysCoffeeOrderSummary, getTodaysCoffeeTotalAmount } from '../db/database.js'

function CoffeePrintOrder({ onBack }) {
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ordersData, summaryData, totalData] = await Promise.all([
        getTodaysCoffeeOrders(),
        getTodaysCoffeeOrderSummary(),
        getTodaysCoffeeTotalAmount()
      ])
      
      setOrders(ordersData)
      setSummary(summaryData)
      setTotalAmount(totalData)
    } catch (err) {
      console.error('Error loading coffee order data:', err)
      setError('Failed to load order data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-800 rounded-full"></div>
            <p className="ml-4 text-gray-600">Loading coffee orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              ← Back
            </button>
          </div>
          <div className="text-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back
          </button>
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-slate-900 
              text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🖨️ Print Orders
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">LuceroYard Coffee Orders</h1>
          <p className="text-gray-600">Today's Orders - {new Date().toLocaleDateString()}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">☕</div>
            <p className="text-gray-600 text-lg">No coffee orders placed today yet!</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Individual Orders</h2>
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          #{index + 1} - {order.customer_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          Order #{index + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-sm">
                        <span>{order.drink_name} with {order.milk_type}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2 mb-4">
                  {summary.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.drink_name} with {item.milk_type}</span>
                      <span>{item.quantity}x</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-300 pt-4">
                  <div className="flex justify-between text-xl font-bold text-blue-800">
                    <span>Total Orders:</span>
                    <span>{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CoffeePrintOrder