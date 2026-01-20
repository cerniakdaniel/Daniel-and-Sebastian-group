import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dane do formularza zamówienia
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Pobierz produkty z backendu
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        setError('Nie udało się pobrać produktów');
      }
    } catch (err) {
      console.error('Błąd pobierania produktów:', err);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie i sortowanie produktów
  useEffect(() => {
    let filtered = [...products];

    // Wyszukiwanie po nazwie
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sortowanie po cenie
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, sortOrder, products]);

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
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Koszyk jest pusty!');
      return;
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
      totalPrice: getTotalPrice()
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
        setCustomerName('');
        setEmail('');
        setPhone('');
        setShowCheckoutForm(false);
        fetchProducts(); // Odśwież produkty (zaktualizowany stan magazynowy)
      } else {
        alert('❌ Błąd: ' + data.message);
      }
    } catch (err) {
      console.error('Błąd składania zamówienia:', err);
      alert('❌ Błąd połączenia z serwerem');
    }
  };

  // Suma
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return <div className="loading">Ładowanie produktów...</div>;
  }

  if (error) {
    return (
      <div className="loading">
        <p style={{color: 'red'}}>{error}</p>
        <button onClick={fetchProducts} style={{marginTop: '20px', padding: '10px 20px'}}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍌 Afrykańskie Owoce Tropikalne 🍍</h1>
        <p>Najświeższe owoce prosto z Afryki!</p>
        <div className="cart-badge">
          🛒 Koszyk: {getTotalItems()}
        </div>
      </header>

      {/* Wyszukiwanie i sortowanie */}
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Szukaj owoców..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label>Sortuj:</label>
          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Cena: od najniższej</option>
            <option value="desc">Cena: od najwyższej</option>
          </select>
        </div>
      </div>

      {/* Produkty */}
      <section className="products">
        <h2>Nasze Produkty</h2>
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-icon">{product.image}</div>
                <h3>{product.name}</h3>
                <p className="origin">📍 {product.origin}</p>
                <p className="description">{product.description}</p>
                <p className="price">{product.price.toFixed(2)} € / {product.unit}</p>
                <p className="stock" style={{color: product.stock < 20 ? '#dc3545' : '#28a745'}}>
                  W magazynie: {product.stock} {product.unit}
                </p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Brak w magazynie' : 'Dodaj do koszyka'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Nie znaleziono produktów 😢</p>
          </div>
        )}
      </section>

      {/* Koszyk */}
      <section className="cart">
        <h2>🛒 Koszyk ({getTotalItems()})</h2>
        {cart.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-icon">{item.image}</div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">{item.price.toFixed(2)} € / {item.unit}</p>
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Podsumowanie</h3>
              <div className="summary-row">
                <span>Produkty ({getTotalItems()}):</span>
                <span>{getTotalPrice().toFixed(2)} €</span>
              </div>
              <div className="summary-row total">
                <span>Suma:</span>
                <span>{getTotalPrice().toFixed(2)} €</span>
              </div>
              
              {!showCheckoutForm ? (
                <div className="cart-actions">
                  <button 
                    className="checkout-btn"
                    onClick={() => setShowCheckoutForm(true)}
                  >
                    Przejdź do płatności 💳
                  </button>
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Wyczyść koszyk
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckout} style={{marginTop: '20px'}}>
                  <h4 style={{marginBottom: '15px'}}>Dane do zamówienia:</h4>
                  <input
                    type="text"
                    placeholder="Imię i nazwisko *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '15px',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                  <button type="submit" className="checkout-btn">
                    Potwierdź zamówienie ✅
                  </button>
                  <button 
                    type="button"
                    className="clear-cart-btn" 
                    onClick={() => setShowCheckoutForm(false)}
                  >
                    Anuluj
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <p>Koszyk jest pusty</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>🌍 Afrykańskie Owoce Tropikalne © 2026</p>
      </footer>
    </div>
  );
}

export default App;