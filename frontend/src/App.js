import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // Pobierz produkty przy starcie
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Błąd pobierania produktów:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Błąd pobierania zamówień:', err);
    }
  };

  // Dodaj do koszyka
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert(`Maksymalna dostępna ilość: ${product.stock} ${product.unit}`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Usuń z koszyka
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Aktualizuj ilość
  const updateQuantity = (productId, change) => {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
      const newQuantity = item.quantity + change;
      
      if (newQuantity > product.stock) {
        alert(`Maksymalna dostępna ilość: ${product.stock} ${product.unit}`);
        return;
      }
      
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }
      
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Wyczyść koszyk
  const clearCart = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić koszyk?')) {
      setCart([]);
    }
  };

  // Złóż zamówienie
  const handleCheckout = async (customerName, email, phone) => {
    if (cart.length === 0) {
      alert('Koszyk jest pusty!');
      return false;
    }

    const orderData = {
      customerName,
      email,
      phone,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Zamówienie #${data.order.id} zostało złożone pomyślnie!\n\nDziękujemy ${customerName}!`);
        setCart([]);
        fetchProducts();
        fetchOrders();
        return true;
      } else {
        alert('❌ Błąd: ' + data.message);
        return false;
      }
    } catch (err) {
      console.error('Błąd składania zamówienia:', err);
      alert('❌ Błąd połączenia z serwerem');
      return false;
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <Router>
      <div className="App">
        <Navigation cartItemsCount={getTotalItems()} />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <ProductList 
                products={products}
                onAddToCart={addToCart}
                onRefresh={fetchProducts}
              />
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProductDetail 
                products={products}
                onAddToCart={addToCart}
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                cart={cart}
                products={products}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onCheckout={handleCheckout}
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <Orders 
                orders={orders}
                onRefresh={fetchOrders}
              />
            } 
          />
        </Routes>

        <footer className="footer">
          <p>🌍 Afrykańskie Owoce Tropikalne © 2026</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
