import { useState, useEffect } from 'react'
import { getTodaysOrders, getTodaysOrderSummary, getTodaysTotalAmount, getAllSandwiches, updateOrder, deleteOrder } from '../db/database.js'

// ANCHOR: print-order-component
function PrintOrder({ onBack }) {
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [editingOrder, setEditingOrder] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [sandwiches, setSandwiches] = useState([])
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    sandwich_id: '',
    notes: ''
  })

  const TAX_RATE = 0.13

  useEffect(() => {
    loadOrderData()
    loadSandwiches()
  }, [])

  const loadOrderData = async () => {
    try {
      const todaysOrders = await getTodaysOrders()
      const orderSummary = await getTodaysOrderSummary()
      const total = await getTodaysTotalAmount()

      setOrders(todaysOrders)
      setSummary(orderSummary)
      setTotalAmount(total)
    } catch (error) {
      alert('Error loading order data: ' + error.message)
    }
  }

  const loadSandwiches = async () => {
    try {
      const allSandwiches = await getAllSandwiches()
      setSandwiches(allSandwiches)
    } catch (error) {
      alert('Error loading sandwiches: ' + error.message)
    }
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setEditFormData({
      customer_name: order.customer_name,
      sandwich_id: order.sandwich_id,
      notes: order.notes || ''
    })
    setShowEditForm(true)
  }

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId)
        loadOrderData()
      } catch (error) {
        alert('Error deleting order: ' + error.message)
      }
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateOrder(editingOrder.id, editFormData.customer_name, editFormData.sandwich_id, editFormData.notes)
      loadOrderData()
      setShowEditForm(false)
      setEditingOrder(null)
    } catch (error) {
      alert('Error updating order: ' + error.message)
    }
  }

  const resetEditForm = () => {
    setEditFormData({
      customer_name: '',
      sandwich_id: '',
      notes: ''
    })
    setEditingOrder(null)
    setShowEditForm(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0 print:hidden">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Today's Orders</h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🖨️</span>
            <span>Print Orders</span>
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

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 print:bg-white print:shadow-none print:p-0 print:rounded-none print:border-none">
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent print:text-black print:bg-none print:text-lg">EbyYard Daily Orders</h1>
          <p className="text-gray-600 print:text-black text-base sm:text-lg mt-2 print:text-sm print:mt-1">{getCurrentDate()}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 print:py-8">
            <div className="text-gray-400 text-8xl mb-6 print:hidden">📋</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2 print:text-black">No orders today yet!</h3>
            <p className="text-gray-500 print:text-black">Orders will appear here as they come in.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">👥</span>
                  <h3 className="text-xl font-bold text-gray-800 print:text-black">Individual Orders</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full print:bg-transparent print:border print:border-gray-400">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-gray-500 print:hidden bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  💡 You can edit or delete orders using the buttons on each order
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 print:space-y-1">
                {orders.map((order, index) => (
                  <div key={order.id} className="bg-white/60 backdrop-blur-sm border border-gray-200 print:border-black rounded-xl p-4 sm:p-6 print:rounded-none print:bg-white print:p-2 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0 print:flex-row print:items-center print:space-y-0">
                      <div className="flex-1 print:flex print:items-center print:space-x-4">
                        <div className="flex items-center space-x-2 mb-2 print:mb-0">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium print:bg-gray-800 print:text-xs">
                            #{index + 1}
                          </span>
                          <h4 className="font-bold text-lg text-gray-800 print:text-black print:text-sm">
                            {order.customer_name}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 mb-1 print:mb-0">
                          <p className="text-gray-700 print:text-black font-medium print:text-sm">
                            {order.sandwich_name}
                          </p>
                        </div>
                        {order.sandwich_ingredients && (
                          <div className="text-xs text-gray-600 print:text-black print:text-xs mb-1">
                            {order.sandwich_ingredients}
                          </div>
                        )}
                        {order.notes && (
                          <div className="print:inline-block">
                            <span className="text-xs text-gray-500 print:text-black">
                              Note: {order.notes}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2 print:flex-row print:items-center print:space-y-0 print:space-x-4">
                        <div className="text-right print:text-sm">
                          <div className="print:hidden">
                            <p className="text-gray-600 text-sm">
                              Subtotal: ${order.sandwich_price.toFixed(2)}
                            </p>
                            <p className="text-gray-600 text-sm">
                              Tax: ${(order.sandwich_price * TAX_RATE).toFixed(2)}
                            </p>
                            <p className="text-emerald-600 font-bold text-xl border-t border-gray-300 pt-1">
                              Total: ${(order.sandwich_price * (1 + TAX_RATE)).toFixed(2)}
                            </p>
                          </div>
                          <div className="hidden print:block">
                            <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                              ${order.sandwich_price.toFixed(2)}
                            </span>
                            <span className="text-gray-600 text-xs">+</span>
                            <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded mx-1">
                              ${(order.sandwich_price * TAX_RATE).toFixed(2)} tax
                            </span>
                            <span className="text-gray-600 text-xs">=</span>
                            <span className="text-emerald-600 font-bold text-sm bg-emerald-100 px-2 py-1 rounded ml-1">
                              ${(order.sandwich_price * (1 + TAX_RATE)).toFixed(2)}
                            </span>
                          </div>
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
                    </div>
                    {order.notes && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 print:hidden rounded-lg border border-amber-200">
                        <div className="flex items-start space-x-2">
                          <span className="text-amber-600">💬</span>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Special Notes:</span> {order.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 print:border-black pt-8 print:pt-4">
              <div className="flex items-center space-x-2 mb-6 print:mb-3">
                <span className="text-xl print:hidden">📊</span>
                <h3 className="text-xl font-bold text-gray-800 print:text-black print:text-base">Order Summary</h3>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-gray-100 rounded-xl p-6 print:rounded-none print:p-3 border border-blue-200 print:border-gray-300">
                <div className="space-y-3 mb-6 print:space-y-1 print:mb-3">
                  {summary.map((item) => (
                    <div key={item.sandwich_name} className="flex justify-between items-center p-3 bg-white/60 print:bg-white print:p-1 rounded-lg border border-blue-100 print:border-gray-200">
                      <div className="flex items-center space-x-3 print:space-x-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium print:bg-gray-800 print:px-1">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-gray-800 print:text-black print:text-sm">
                          {item.sandwich_name}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 print:text-black text-lg print:text-sm">
                        ${item.total_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-blue-200 print:border-black pt-6 print:pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-4 print:gap-2 print:text-xs">
                    <div className="text-center sm:text-left print:text-left">
                      <p className="text-sm text-gray-600 print:text-black print:text-xs">Orders</p>
                      <p className="text-2xl font-bold text-gray-800 print:text-black print:text-sm">
                        {orders.length}
                      </p>
                    </div>
                    <div className="text-center print:text-left">
                      <p className="text-sm text-gray-600 print:text-black print:text-xs">Subtotal</p>
                      <p className="text-2xl font-bold text-gray-800 print:text-black print:text-sm">
                        ${totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center sm:text-right print:text-left">
                      <p className="text-sm text-gray-600 print:text-black print:text-xs">Tax ({(TAX_RATE * 100).toFixed(0)}%)</p>
                      <p className="text-xl font-bold text-gray-800 print:text-black print:text-sm">
                        ${(totalAmount * TAX_RATE).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center print:text-center col-span-3 print:col-span-1">
                      <p className="text-sm text-gray-600 print:text-black print:text-xs">Total</p>
                      <p className="text-4xl font-bold text-emerald-600 print:text-black print:text-base print:font-bold">
                        ${(totalAmount * (1 + TAX_RATE)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center print:mt-4">
              <div className="inline-flex items-center space-x-2 text-gray-500 print:text-black text-sm bg-gray-100 print:bg-transparent px-4 py-2 rounded-lg print:rounded-none border print:border-gray-400 print:text-xs">
                <span className="print:hidden">🕒</span>
                <span>Generated on {new Date().toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Order Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-4">
                  <span className="text-white text-xl">✏️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Edit Order</h3>
                <p className="text-gray-600 text-sm">Update the order details below</p>
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
                    Sandwich
                  </label>
                  <select
                    value={editFormData.sandwich_id}
                    onChange={(e) => setEditFormData({...editFormData, sandwich_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    required
                  >
                    <option value="">Select a sandwich</option>
                    {sandwiches.map((sandwich) => (
                      <option key={sandwich.id} value={sandwich.id}>
                        {sandwich.name} - ${sandwich.price.toFixed(2)}
                      </option>
                    ))}
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

export default PrintOrder
