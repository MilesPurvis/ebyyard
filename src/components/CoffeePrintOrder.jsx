// ANCHOR: coffee-print-order-component
import { useState, useEffect } from 'react'
import { getTodaysCoffeeOrders, getTodaysCoffeeOrderSummary, getTodaysCoffeeTotalAmount, deleteCoffeeOrder, updateCoffeeOrder } from '../db/database.js'

function CoffeePrintOrder({ onBack }) {
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    drink_name: '',
    milk_type: '',
    notes: ''
  })

  const coffeeTypes = [
    { id: 'cappuccino', name: 'Cappuccino' },
    { id: 'cortado', name: 'Cortado' },
    { id: 'flat-white', name: 'Flat White' },
    { id: 'latte', name: 'Latte' },
    { id: 'coffee-latte', name: 'Coffee Latte' },
    { id: 'matcha-latte', name: 'Matcha Latte' },
    { id: 'strawberry-latte', name: 'Strawberry Latte' },
    { id: 'coffee-strawberry-latte', name: 'Coffee Strawberry Latte' },
    { id: 'matcha-strawberry-latte', name: 'Matcha Strawberry Latte' },
    { id: 'hot-chocolate', name: 'Hot Chocolate' },
    { id: 'drip-coffee', name: 'Drip Coffee' },
    { id: 'pour-over', name: 'Pour Over' },
    { id: 'tea', name: 'Tea' }
  ]

  const milkTypes = ['none', 'oat milk', 'dairy milk']

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

  const handleEdit = (order) => {
    setEditingOrder(order)
    setEditFormData({
      customer_name: order.customer_name,
      drink_name: order.drink_name,
      milk_type: order.milk_type,
      notes: order.notes || ''
    })
    setShowEditForm(true)
  }

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this coffee order?')) {
      try {
        await deleteCoffeeOrder(orderId)
        loadData()
      } catch (error) {
        alert('Error deleting coffee order: ' + error.message)
      }
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateCoffeeOrder(editingOrder.id, editFormData.customer_name, editFormData.drink_name, editFormData.milk_type, editFormData.notes)
      loadData()
      setShowEditForm(false)
      setEditingOrder(null)
    } catch (error) {
      alert('Error updating coffee order: ' + error.message)
    }
  }

  const resetEditForm = () => {
    setEditFormData({
      customer_name: '',
      drink_name: '',
      milk_type: '',
      notes: ''
    })
    setEditingOrder(null)
    setShowEditForm(false)
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
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          #{index + 1} - {order.customer_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 print:hidden">
                        <button
                          onClick={() => handleEdit(order)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-sm">
                        <span className="font-medium">{order.drink_name}</span>
                        <span className="text-gray-600"> with {order.milk_type === 'none' ? 'black' : order.milk_type}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
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

      {/* Edit Coffee Order Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-4">
                  <span className="text-white text-xl">✏️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Edit Coffee Order</h3>
                <p className="text-gray-600 text-sm">Update the coffee order details below</p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.customer_name}
                    onChange={(e) => setEditFormData({...editFormData, customer_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drink
                  </label>
                  <select
                    value={editFormData.drink_name}
                    onChange={(e) => setEditFormData({...editFormData, drink_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    required
                  >
                    <option value="">Select a drink</option>
                    {/* Regular coffee drinks */}
                    <option value="Cappuccino">Cappuccino</option>
                    <option value="Cortado">Cortado</option>
                    <option value="Flat White">Flat White</option>
                    <option value="Hot Chocolate">Hot Chocolate</option>
                    <option value="Drip Coffee">Drip Coffee</option>
                    <option value="Pour Over">Pour Over</option>
                    <option value="Tea">Tea</option>
                    {/* Coffee base lattes */}
                    <option value="Coffee Latte">Coffee Latte</option>
                    <option value="Coffee Strawberry Latte">Coffee Strawberry Latte</option>
                    {/* Matcha base lattes */}
                    <option value="Matcha Latte">Matcha Latte</option>
                    <option value="Matcha Strawberry Latte">Matcha Strawberry Latte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Milk Type
                  </label>
                  <select
                    value={editFormData.milk_type}
                    onChange={(e) => setEditFormData({...editFormData, milk_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    required
                  >
                    <option value="">Select milk type</option>
                    {/* Only show Black option for drinks that can be black */}
                    {['Drip Coffee', 'Tea', 'Pour Over'].includes(editFormData.drink_name) && (
                      <option value="none">☕ Black (No Milk)</option>
                    )}
                    <option value="oat milk">🌾 Oat Milk</option>
                    <option value="dairy milk">🥛 Dairy Milk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    rows="3"
                    placeholder="Any special requests or allergy information..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Update Order
                  </button>
                  <button
                    type="button"
                    onClick={resetEditForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200"
                  >
                    Cancel
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

export default CoffeePrintOrder