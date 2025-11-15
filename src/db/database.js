import { createClient } from '@supabase/supabase-js'

// ANCHOR: supabase-initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ANCHOR: sandwich-crud-operations
export async function getAllSandwiches() {
  const { data, error } = await supabase
    .from('sandwiches')
    .select('*')
    .order('type')
    .order('name')

  if (error) {
    console.error('Error fetching sandwiches:', error)
    throw new Error('Failed to fetch sandwiches')
  }

  return data || []
}

export async function getActiveSandwiches() {
  const { data, error } = await supabase
    .from('sandwiches')
    .select('*')
    .eq('is_active', true)
    .order('type')
    .order('name')

  if (error) {
    console.error('Error fetching active sandwiches:', error)
    throw new Error('Failed to fetch active sandwiches')
  }

  return data || []
}

export async function getSandwichById(id) {
  const { data, error } = await supabase
    .from('sandwiches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching sandwich:', error)
    return null
  }

  return data
}

export async function findSandwichByName(name) {
  const { data, error } = await supabase
    .from('sandwiches')
    .select('*')
    .ilike('name', `%${name.trim()}%`)
    .limit(1)

  if (error) {
    console.error('Error finding sandwich:', error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

export async function addSandwich(name, type, ingredients, price, isActive = false, addons = []) {
  const { data, error } = await supabase
    .from('sandwiches')
    .insert([{ name, type, ingredients, price, is_active: isActive, addons: addons.length > 0 ? addons : null }])
    .select()

  if (error) {
    console.error('Error adding sandwich:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to add sandwich: ${errorMessage}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Sandwich was not saved - no data returned from database')
  }

  return { success: true, data: data[0] }
}

export async function updateSandwich(id, name, type, ingredients, price, addons = []) {
  const { data, error } = await supabase
    .from('sandwiches')
    .update({ name, type, ingredients, price, addons: addons.length > 0 ? addons : null })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating sandwich:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to update sandwich: ${errorMessage}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Sandwich was not updated - no data returned from database')
  }

  return { success: true, data: data[0] }
}

export async function toggleSandwichActive(id, isActive) {
  const { data, error } = await supabase
    .from('sandwiches')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error toggling sandwich active status:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to update sandwich: ${errorMessage}`)
  }

  return { success: true, data: data[0] }
}

export async function setAllSandwichesInactive() {
  // Supabase requires a WHERE clause for UPDATE operations
  // Use .gte('id', 0) to match all rows (since IDs are typically positive integers)
  const { error } = await supabase
    .from('sandwiches')
    .update({ is_active: false })
    .gte('id', 0) // This matches all rows since IDs are positive integers

  if (error) {
    console.error('Error setting all sandwiches inactive:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to clear weekly menu: ${errorMessage}`)
  }

  return { success: true }
}

export async function deleteSandwich(id) {
  const { data, error } = await supabase
    .from('sandwiches')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error deleting sandwich:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'

    // Check for common error types
    if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
      throw new Error('Cannot delete sandwich: It is referenced by existing orders. Delete the orders first, or the sandwich details are preserved in order history.')
    } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
      throw new Error('Permission denied: Check your Supabase Row Level Security (RLS) policies for the sandwiches table.')
    } else {
      throw new Error(`Failed to delete sandwich: ${errorMessage}`)
    }
  }

  if (!data || data.length === 0) {
    throw new Error('Sandwich not found or already deleted')
  }

  return { success: true }
}

// ANCHOR: order-operations
export async function addOrder(customerName, sandwichId, notes = '', selectedAddons = [], cookieQuantity = 0) {
  const today = new Date().toISOString().split('T')[0]

  // First, get the full sandwich details to store in the order
  const sandwich = await getSandwichById(sandwichId)
  if (!sandwich) {
    throw new Error('Sandwich not found')
  }

  // Calculate total price including addons, cookies, and tax
  const basePrice = sandwich.price || 0
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
  const cookiesPrice = cookieQuantity * 4
  const subtotal = basePrice + addonsPrice + cookiesPrice
  const tax = subtotal * 0.13
  const totalPrice = subtotal + tax

  // Store both the sandwich_id (for reference) and full details (for historical tracking)
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      customer_name: customerName,
      sandwich_id: sandwichId,
      sandwich_name: sandwich.name,
      sandwich_type: sandwich.type,
      sandwich_ingredients: sandwich.ingredients,
      sandwich_price: totalPrice, // Store total price including addons, cookies, and tax
      addons: selectedAddons.length > 0 ? selectedAddons : null, // Store selected addons
      cookie_quantity: cookieQuantity, // Store cookie quantity
      notes,
      order_date: today,
      payment_status: 'unpaid' // Default to unpaid
    }])
    .select()

  if (error) {
    console.error('Error adding order:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to add order: ${errorMessage}`)
  }

  return { success: true, data: data[0] }
}

export async function getTodaysOrders() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_date', today)
    .order('created_at')

  if (error) {
    console.error('Error fetching todays orders:', error)
    throw new Error('Failed to fetch orders')
  }

  // Use stored sandwich details (for historical accuracy) or fall back to join if needed
  const transformedData = data?.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    notes: order.notes,
    created_at: order.created_at,
    sandwich_id: order.sandwich_id,
    sandwich_name: order.sandwich_name || 'Unknown',
    sandwich_type: order.sandwich_type || 'Unknown',
    sandwich_ingredients: order.sandwich_ingredients || '',
    sandwich_price: order.sandwich_price || 0,
    addons: order.addons || [],
    cookie_quantity: order.cookie_quantity || 0,
    payment_status: order.payment_status || 'unpaid'
  })) || []

  return transformedData
}

export async function getTodaysOrderSummary() {
  const today = new Date().toISOString().split('T')[0]

  // Get all order data including addons
  const { data, error } = await supabase
    .from('orders')
    .select('sandwich_name, sandwich_price, addons, cookie_quantity')
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching order summary:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to fetch order summary: ${errorMessage}`)
  }

  // Group by sandwich + addons combination
  const sandwichSummary = {}
  let totalCookies = 0

  data?.forEach(order => {
    const sandwichName = order.sandwich_name || 'Unknown'
    const addons = order.addons || []
    const addonsKey = addons.length > 0
      ? addons.map(a => a.name).sort().join(', ')
      : 'no-addons'

    // Create a unique key for sandwich + addons combination
    const key = `${sandwichName}${addonsKey !== 'no-addons' ? ` (${addonsKey})` : ''}`
    const price = parseFloat(order.sandwich_price || 0)

    if (sandwichSummary[key]) {
      sandwichSummary[key].quantity += 1
      sandwichSummary[key].total_price += price
    } else {
      sandwichSummary[key] = {
        sandwich_name: sandwichName,
        addons: addons,
        quantity: 1,
        total_price: price
      }
    }

    // Count cookies
    if (order.cookie_quantity) {
      totalCookies += order.cookie_quantity
    }
  })

  const result = {
    sandwiches: Object.values(sandwichSummary).sort((a, b) => a.sandwich_name.localeCompare(b.sandwich_name)),
    cookies: totalCookies > 0 ? { quantity: totalCookies, total_price: totalCookies * 4 } : null
  }

  return result
}

export async function getTodaysTotalAmount() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('orders')
    .select('sandwich_price')
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching total amount:', error)
    throw new Error('Failed to fetch total amount')
  }

  const total = data?.reduce((sum, order) => {
    return sum + parseFloat(order.sandwich_price || 0)
  }, 0) || 0

  return total
}

export async function getTodaysOrderCount() {
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching order count:', error)
    throw new Error('Failed to fetch order count')
  }

  return count || 0
}

export async function getAllTimeOrderCount() {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching all-time order count:', error)
    throw new Error('Failed to fetch all-time order count')
  }

  return count || 0
}

// ANCHOR: order-crud-operations
export async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  // Use stored sandwich details for historical accuracy
  return {
    id: data.id,
    customer_name: data.customer_name,
    sandwich_id: data.sandwich_id,
    notes: data.notes,
    created_at: data.created_at,
    order_date: data.order_date,
    sandwich_name: data.sandwich_name || 'Unknown',
    sandwich_type: data.sandwich_type || 'Unknown',
    sandwich_ingredients: data.sandwich_ingredients || '',
    sandwich_price: data.sandwich_price || 0,
    payment_status: data.payment_status || 'unpaid'
  }
}

export async function updateOrder(id, customerName, sandwichId, notes = '') {
  // Get the full sandwich details to store in the order
  const sandwich = await getSandwichById(sandwichId)
  if (!sandwich) {
    throw new Error('Sandwich not found')
  }

  // Update with both sandwich_id and full details for historical tracking
  const { data, error } = await supabase
    .from('orders')
    .update({
      customer_name: customerName,
      sandwich_id: sandwichId,
      sandwich_name: sandwich.name,
      sandwich_type: sandwich.type,
      sandwich_ingredients: sandwich.ingredients,
      sandwich_price: sandwich.price,
      notes
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating order:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to update order: ${errorMessage}`)
  }

  return { success: true, data: data[0] }
}

export async function deleteOrder(id) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting order:', error)
    throw new Error('Failed to delete order')
  }

  return { success: true }
}

// ANCHOR: payment-operations
export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', orderId)
    .select()

  if (error) {
    console.error('Error updating payment status:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to update payment status: ${errorMessage}`)
  }

  return { success: true, data: data[0] }
}

// ANCHOR: historical-order-tracking
export async function getOrdersByCustomer(customerName) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('customer_name', `%${customerName}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer orders:', error)
    throw new Error('Failed to fetch customer orders')
  }

  return data?.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    notes: order.notes,
    created_at: order.created_at,
    order_date: order.order_date,
    sandwich_id: order.sandwich_id,
    sandwich_name: order.sandwich_name || 'Unknown',
    sandwich_type: order.sandwich_type || 'Unknown',
    sandwich_ingredients: order.sandwich_ingredients || '',
    sandwich_price: order.sandwich_price || 0
  })) || []
}

export async function getOrdersByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .gte('order_date', startDate)
    .lte('order_date', endDate)
    .order('order_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders by date range:', error)
    throw new Error('Failed to fetch orders by date range')
  }

  return data?.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    notes: order.notes,
    created_at: order.created_at,
    order_date: order.order_date,
    sandwich_id: order.sandwich_id,
    sandwich_name: order.sandwich_name || 'Unknown',
    sandwich_type: order.sandwich_type || 'Unknown',
    sandwich_ingredients: order.sandwich_ingredients || '',
    sandwich_price: order.sandwich_price || 0
  })) || []
}

export async function getAllOrders(limit = 100) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching all orders:', error)
    throw new Error('Failed to fetch all orders')
  }

  return data?.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    notes: order.notes,
    created_at: order.created_at,
    order_date: order.order_date,
    sandwich_id: order.sandwich_id,
    sandwich_name: order.sandwich_name || 'Unknown',
    sandwich_type: order.sandwich_type || 'Unknown',
    sandwich_ingredients: order.sandwich_ingredients || '',
    sandwich_price: order.sandwich_price || 0
  })) || []
}

// Legacy function for compatibility - no longer needed with Supabase
export async function initDatabase() {
  // Supabase handles initialization automatically
  return true
}

// ANCHOR: coffee-order-operations
export async function addCoffeeOrder(customerName, drinkName, milkType, notes = '') {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('coffee_orders')
    .insert([{
      customer_name: customerName,
      drink_name: drinkName,
      milk_type: milkType,
      notes,
      order_date: today
    }])
    .select()

  if (error) {
    console.error('Error adding coffee order:', error)
    const errorMessage = error.message || error.details || error.hint || 'Unknown database error'
    throw new Error(`Failed to add coffee order: ${errorMessage}`)
  }

  return { success: true, data: data[0] }
}

export async function getTodaysCoffeeOrders() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('coffee_orders')
    .select('*')
    .eq('order_date', today)
    .order('created_at')

  if (error) {
    console.error('Error fetching todays coffee orders:', error)
    throw new Error('Failed to fetch coffee orders')
  }

  return data || []
}

export async function getTodaysCoffeeOrderSummary() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('coffee_orders')
    .select('drink_name, milk_type')
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching coffee order summary:', error)
    throw new Error('Failed to fetch coffee order summary')
  }

  // Group by drink name and milk type
  const summary = {}
  data?.forEach(order => {
    const key = `${order.drink_name}-${order.milk_type}`

    if (summary[key]) {
      summary[key].quantity += 1
    } else {
      summary[key] = {
        drink_name: order.drink_name,
        milk_type: order.milk_type,
        quantity: 1
      }
    }
  })

  return Object.values(summary).sort((a, b) => a.drink_name.localeCompare(b.drink_name))
}

export async function getTodaysCoffeeTotalAmount() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('coffee_orders')
    .select('*')
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching coffee total amount:', error)
    throw new Error('Failed to fetch coffee total amount')
  }

  // Since we removed prices, return count of orders
  return data?.length || 0
}

export async function deleteCoffeeOrder(id) {
  const { error } = await supabase
    .from('coffee_orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting coffee order:', error)
    throw new Error('Failed to delete coffee order')
  }

  return { success: true }
}

export async function updateCoffeeOrder(id, customerName, drinkName, milkType, notes = '') {
  const { data, error } = await supabase
    .from('coffee_orders')
    .update({
      customer_name: customerName,
      drink_name: drinkName,
      milk_type: milkType,
      notes
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating coffee order:', error)
    throw new Error('Failed to update coffee order')
  }

  return { success: true, data: data[0] }
}


export function getDatabase() {
  return supabase
}
