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

export async function addSandwich(name, type, ingredients, price) {
  const { data, error } = await supabase
    .from('sandwiches')
    .insert([{ name, type, ingredients, price }])
    .select()

  if (error) {
    console.error('Error adding sandwich:', error)
    throw new Error('Failed to add sandwich')
  }

  return { success: true, data: data[0] }
}

export async function updateSandwich(id, name, type, ingredients, price) {
  const { data, error } = await supabase
    .from('sandwiches')
    .update({ name, type, ingredients, price })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating sandwich:', error)
    throw new Error('Failed to update sandwich')
  }

  return { success: true, data: data[0] }
}

export async function deleteSandwich(id) {
  const { error } = await supabase
    .from('sandwiches')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting sandwich:', error)
    throw new Error('Failed to delete sandwich')
  }

  return { success: true }
}

// ANCHOR: order-operations
export async function addOrder(customerName, sandwichId, notes = '') {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      customer_name: customerName,
      sandwich_id: sandwichId,
      notes
    }])
    .select()

  if (error) {
    console.error('Error adding order:', error)
    throw new Error('Failed to add order')
  }

  return { success: true, data: data[0] }
}

export async function getTodaysOrders() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      notes,
      created_at,
      sandwiches!inner (
        name,
        type,
        price
      )
    `)
    .eq('order_date', today)
    .order('created_at')

  if (error) {
    console.error('Error fetching todays orders:', error)
    throw new Error('Failed to fetch orders')
  }

  // Transform the data to match the old format
  const transformedData = data?.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    notes: order.notes,
    created_at: order.created_at,
    sandwich_name: order.sandwiches.name,
    sandwich_type: order.sandwiches.type,
    sandwich_price: order.sandwiches.price
  })) || []

  return transformedData
}

export async function getTodaysOrderSummary() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('orders')
    .select(`
      sandwiches!inner (
        name,
        price
      )
    `)
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching order summary:', error)
    throw new Error('Failed to fetch order summary')
  }

  // Group by sandwich and calculate totals
  const summary = {}
  data?.forEach(order => {
    const sandwichName = order.sandwiches.name
    const price = parseFloat(order.sandwiches.price)

    if (summary[sandwichName]) {
      summary[sandwichName].quantity += 1
      summary[sandwichName].total_price += price
    } else {
      summary[sandwichName] = {
        sandwich_name: sandwichName,
        sandwich_price: price,
        quantity: 1,
        total_price: price
      }
    }
  })

  return Object.values(summary).sort((a, b) => a.sandwich_name.localeCompare(b.sandwich_name))
}

export async function getTodaysTotalAmount() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('orders')
    .select(`
      sandwiches!inner (
        price
      )
    `)
    .eq('order_date', today)

  if (error) {
    console.error('Error fetching total amount:', error)
    throw new Error('Failed to fetch total amount')
  }

  const total = data?.reduce((sum, order) => {
    return sum + parseFloat(order.sandwiches.price)
  }, 0) || 0

  return total
}

// ANCHOR: order-crud-operations
export async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      sandwich_id,
      notes,
      created_at,
      sandwiches!inner (
        name,
        type,
        price
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  // Transform to match old format
  return {
    id: data.id,
    customer_name: data.customer_name,
    sandwich_id: data.sandwich_id,
    notes: data.notes,
    created_at: data.created_at,
    sandwich_name: data.sandwiches.name,
    sandwich_type: data.sandwiches.type,
    sandwich_price: data.sandwiches.price
  }
}

export async function updateOrder(id, customerName, sandwichId, notes = '') {
  const { data, error } = await supabase
    .from('orders')
    .update({
      customer_name: customerName,
      sandwich_id: sandwichId,
      notes
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating order:', error)
    throw new Error('Failed to update order')
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
