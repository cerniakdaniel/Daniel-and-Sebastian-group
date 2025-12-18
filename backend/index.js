const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dane produktów
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

// Przechowywanie zamówień
let orders = [];
let orderIdCounter = 1;

// Routes - Produkty
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

// Routes - Zamówienia
app.post('/api/orders', (req, res) => {
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
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Niewystarczająca ilość produktu: ${product?.name || 'nieznany'}` 
      });
    }
  }

  // Utwórz zamówienie
  const newOrder = {
    id: orderIdCounter++,
    customerName,
    email,
    phone,
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

// Routes - Koszyk
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ success: false, message: 'Produkt nie znaleziony' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ 
      success: false, 
      message: 'Niewystarczająca ilość w magazynie' 
    });
  }

  res.json({ 
    success: true, 
    message: 'Produkt dodany do koszyka',
    product,
    quantity
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serwer działa poprawnie' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint nie znaleziony' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Wystąpił błąd serwera' 
  });
});

// Start serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
  console.log(`🍌 API dostępne pod: http://localhost:${PORT}/api`);
});
