import initSqlJs from 'sql.js';

// ANCHOR: database-initialization
let db;
let SQL;

export async function initDatabase() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
  }

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem('ebyyard_db');
  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
  }

  // Create sandwiches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sandwiches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Focaccia', 'Hoagie')),
      ingredients TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

  // Create orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      sandwich_id INTEGER NOT NULL,
      notes TEXT,
      order_date DATE DEFAULT CURRENT_DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sandwich_id) REFERENCES sandwiches (id)
    )
  `);

  // Insert default sandwiches if none exist
  const sandwichCount = db.exec('SELECT COUNT(*) as count FROM sandwiches')[0];
  if (!sandwichCount || sandwichCount.values[0][0] === 0) {
    insertDefaultSandwiches();
  }

  // Save database to localStorage
  saveDatabase();

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    localStorage.setItem('ebyyard_db', JSON.stringify(Array.from(data)));
  }
}

function insertDefaultSandwiches() {
  // Default Focaccia sandwiches
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Margherita', 'Focaccia', 'Fresh mozzarella, tomatoes, basil, olive oil', 12.99)`);
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Prosciutto', 'Focaccia', 'Prosciutto, arugula, tomatoes, balsamic glaze', 15.99)`);
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Veggie', 'Focaccia', 'Roasted vegetables, goat cheese, pesto', 13.99)`);

  // Default Hoagie sandwiches
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Italian', 'Hoagie', 'Salami, ham, provolone, lettuce, tomato, oil & vinegar', 11.99)`);
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Turkey Club', 'Hoagie', 'Turkey, bacon, lettuce, tomato, mayo', 12.99)`);
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('Chicken Parm', 'Hoagie', 'Breaded chicken, marinara, mozzarella', 13.99)`);

  saveDatabase();
}

// ANCHOR: sandwich-crud-operations
export function getAllSandwiches() {
  const result = db.exec('SELECT * FROM sandwiches ORDER BY type, name');
  if (!result[0]) return [];

  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}

export function getSandwichById(id) {
  const result = db.exec(`SELECT * FROM sandwiches WHERE id = ${id}`);
  if (!result[0] || !result[0].values[0]) return null;

  const { columns, values } = result[0];
  const obj = {};
  columns.forEach((col, index) => {
    obj[col] = values[0][index];
  });
  return obj;
}

export function addSandwich(name, type, ingredients, price) {
  db.exec(`INSERT INTO sandwiches (name, type, ingredients, price) VALUES ('${name}', '${type}', '${ingredients}', ${price})`);
  saveDatabase();
  return { success: true };
}

export function updateSandwich(id, name, type, ingredients, price) {
  db.exec(`UPDATE sandwiches SET name = '${name}', type = '${type}', ingredients = '${ingredients}', price = ${price} WHERE id = ${id}`);
  saveDatabase();
  return { success: true };
}

export function deleteSandwich(id) {
  db.exec(`DELETE FROM sandwiches WHERE id = ${id}`);
  saveDatabase();
  return { success: true };
}

// ANCHOR: order-operations
export function addOrder(customerName, sandwichId, notes = '') {
  db.exec(`INSERT INTO orders (customer_name, sandwich_id, notes) VALUES ('${customerName}', ${sandwichId}, '${notes}')`);
  saveDatabase();
  return { success: true };
}

export function getTodaysOrders() {
  const result = db.exec(`
    SELECT
      o.id,
      o.customer_name,
      o.notes,
      o.created_at,
      s.name as sandwich_name,
      s.type as sandwich_type,
      s.price as sandwich_price
    FROM orders o
    JOIN sandwiches s ON o.sandwich_id = s.id
    WHERE o.order_date = date('now')
    ORDER BY o.created_at
  `);

  if (!result[0]) return [];

  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}

export function getTodaysOrderSummary() {
  const result = db.exec(`
    SELECT
      s.name as sandwich_name,
      s.price as sandwich_price,
      COUNT(*) as quantity,
      (s.price * COUNT(*)) as total_price
    FROM orders o
    JOIN sandwiches s ON o.sandwich_id = s.id
    WHERE o.order_date = date('now')
    GROUP BY s.id, s.name, s.price
    ORDER BY s.name
  `);

  if (!result[0]) return [];

  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}

export function getTodaysTotalAmount() {
  const result = db.exec(`
    SELECT SUM(s.price) as total
    FROM orders o
    JOIN sandwiches s ON o.sandwich_id = s.id
    WHERE o.order_date = date('now')
  `);

  if (!result[0] || !result[0].values[0]) return 0;
  return result[0].values[0][0] || 0;
}

// ANCHOR: order-crud-operations
export function getOrderById(id) {
  const result = db.exec(`
    SELECT
      o.id,
      o.customer_name,
      o.sandwich_id,
      o.notes,
      o.created_at,
      s.name as sandwich_name,
      s.type as sandwich_type,
      s.price as sandwich_price
    FROM orders o
    JOIN sandwiches s ON o.sandwich_id = s.id
    WHERE o.id = ${id}
  `);

  if (!result[0] || !result[0].values[0]) return null;

  const { columns, values } = result[0];
  const obj = {};
  columns.forEach((col, index) => {
    obj[col] = values[0][index];
  });
  return obj;
}

export function updateOrder(id, customerName, sandwichId, notes = '') {
  db.exec(`UPDATE orders SET customer_name = '${customerName}', sandwich_id = ${sandwichId}, notes = '${notes}' WHERE id = ${id}`);
  saveDatabase();
  return { success: true };
}

export function deleteOrder(id) {
  db.exec(`DELETE FROM orders WHERE id = ${id}`);
  saveDatabase();
  return { success: true };
}

export function getDatabase() {
  return db;
}
