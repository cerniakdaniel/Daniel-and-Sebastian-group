const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ścieżki do plików JSON
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Dane początkowe
let products = [
  { 
    id: 1, 
    name: 'Banany', 
    price: 5.99, 
    description: 'Świeże banany z Ugandy i Tanzanii',
    unit: 'kg',
    stock: 100,
    image: '🍌',
    origin: 'Uganda, Tanzania'
  },
  { 
    id: 2, 
    name: 'Kokosy', 
    price: 8.99, 
    description: 'Soczyste kokosy z wybrzeża Kenii',
    unit: 'szt',
    stock: 50,
    image: '🥥',
    origin: 'Kenia'
  },
  {
    id: 3,
    name: 'Mango',
    price: 12.99,
    description: 'Słodkie mango z Senegalu',
    unit: 'kg',
    stock: 75,
    image: '🥭',
    origin: 'Senegal'
  },
  {
    id: 4,
    name: 'Papaja',
    price: 9.99,
    description: 'Dojrzałe papaje z Ghany',
    unit: 'kg',
    stock: 60,
    image: '🍈',
    origin: 'Ghana'
  },
  {
    id: 5,
    name: 'Ananas',
    price: 7.99,
    description: 'Soczyste ananasy z Wybrzeża Kości Słoniowej',
    unit: 'szt',
    stock: 80,
    image: '🍍',
    origin: 'Wybrzeże Kości Słoniowej'
  },
  {
    id: 6,
    name: 'Arbuz',
    price: 4.99,
    description: 'Słodkie arbuzy z Egiptu',
    unit: 'kg',
    stock: 120,
    image: '🍉',
    origin: 'Egipt'
  },
  {
    id: 7,
    name: 'Marakuja',
    price: 15.99,
    description: 'Egzotyczna marakuja z Rwandy',
    unit: 'kg',
    stock: 40,
    image: '🫐',
    origin: 'Rwanda'
  },
  {
    id: 8,
    name: 'Awokado',
    price: 13.99,
    description: 'Kremowe awokado z RPA',
    unit: 'kg',
    stock: 90,
    image: '🥑',
    origin: 'Republika Południowej Afryki'
  }
];

let orders = [];
let orderIdCounter = 1;

// ======== FUNKCJE POMOCNICZE ========

// Stwórz katalog data jeśli nie istnieje
async function initDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('📁 Katalog data utworzony/sprawdzony');
  } catch (err) {
    console.error('Błąd tworzenia katalogu:', err);
  }
}

// Zapisz produkty do pliku JSON
async function saveProducts() {
  try {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    console.log('💾 Produkty zapisane do products.json');
  } catch (err) {
    console.error('Błąd zapisu produktów:', err);
  }
}

// Wczytaj produkty z pliku JSON
async function loadProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    products = JSON.parse(data);
    console.log('📖 Produkty wczytane z products.json');
  } catch (err) {
    console.log('⚠️ Brak pliku products.json, używam domyślnych danych');
    await saveProducts(); // Zapisz domyślne dane
  }
}

// Zapisz zamówienia do pliku JSON
async function saveOrders() {
  try {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    console.log('💾 Zamówienia zapisane do orders.json');
  } catch (err) {
    console.error('Błąd zapisu zamówień:', err);
  }
}

// Wczytaj zamówienia z pliku JSON
async function loadOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    const loadedOrders = JSON.parse(data);
    orders = loadedOrders;
    // Ustaw orderIdCounter na najwyższe ID + 1
    if (orders.length > 0) {
      orderIdCounter = Math.max(...orders.map(o => o.id)) + 1;
    }
    console.log('📖 Zamówienia wczytane z orders.json');
  } catch (err) {
    console.log('⚠️ Brak pliku orders.json, tworzę nowy');
    await saveOrders();
  }
}

// ======== ROUTES - PRODUKTY ========

app.get('/api/products', (req, res) => {
  res.json({ success: true, products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produkt nie znaleziony' });
  }
  res.json({ success: true, product });
});

// ======== ROUTES - ZAMÓWIENIA ========

app.post('/api/orders', async (req, res) => {
  const { customerName, email, phone, items, totalPrice } = req.body;
  
  // Walidacja
  if (!customerName || !email || !items || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Brak wymaganych danych' 
    });
  }

  // Sprawdź dostępność produktów
  for (let item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ 
        success: false, 
        message: `Produkt nie znaleziony: ID ${item.productId}` 
      });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Niewystarczająca ilość produktu: ${product.name}` 
      });
    }
  }

  // Utwórz zamówienie
  const newOrder = {
    id: orderIdCounter++,
    customerName,
    email,
    phone: phone || '',
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Zaktualizuj stan magazynowy
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });

  orders.push(newOrder);
  
  // ZAPISZ DO PLIKÓW JSON
  await saveProducts();
  await saveOrders();
  
  res.status(201).json({ 
    success: true, 
    message: 'Zamówienie zostało złożone pomyślnie',
    order: newOrder 
  });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ success: false, message: 'Zamówienie nie znalezione' });
  }
  res.json({ success: true, order });
});

// ======== ROUTES - KOSZYK ========

app.post('/api/cart/validate', (req, res) => {
  const { items } = req.body;
  
  const validationErrors = [];
  
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      validationErrors.push(`Produkt ${item.productId} nie istnieje`);
    } else if (product.stock < item.quantity) {
      validationErrors.push(`${product.name}: dostępne tylko ${product.stock} ${product.unit}`);
    }
  });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      errors: validationErrors 
    });
  }
  
  res.json({ success: true, message: 'Koszyk poprawny' });
});

// ======== HEALTH CHECK ========

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serwer działa poprawnie',
    timestamp: new Date().toISOString()
  });
});

// ======== 404 HANDLER ========

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint nie znaleziony' });
});

// ======== ERROR HANDLER ========

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Wystąpił błąd serwera' 
  });
});

// ======== START SERWERA ========

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDataDir();
  await loadProducts();
  await loadOrders();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
    console.log(`🌍 API dostępne pod: http://localhost:${PORT}/api`);
    console.log(`📦 Produktów w bazie: ${products.length}`);
    console.log(`📋 Zamówień w bazie: ${orders.length}`);
  });
}

startServer();