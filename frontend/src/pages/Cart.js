import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart({ cart, products, onUpdateQuantity, onRemoveFromCart, onClearCart, onCheckout }) {
  const navigate = useNavigate();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const success = await onCheckout(customerName, email, phone);
    
    if (success) {
      setCustomerName('');
      setEmail('');
      setPhone('');
      setShowCheckoutForm(false);
      navigate('/orders');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-message">
          <h2>🛒 Koszyk jest pusty</h2>
          <p>Dodaj produkty aby kontynuować zakupy</p>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Przejdź do produktów
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 Koszyk ({getTotalItems()} produktów)</h1>

      <div className="cart-content">
        <div className="cart-items-section">
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
                  onClick={() => onUpdateQuantity(item.id, -1)}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => onUpdateQuantity(item.id, 1)}
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
                onClick={() => onRemoveFromCart(item.id)}
                title="Usuń"
              >
                ✖
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary-section">
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
                <button className="clear-cart-btn" onClick={onClearCart}>
                  Wyczyść koszyk
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="checkout-form">
                <h4>Dane do zamówienia:</h4>
                <input
                  type="text"
                  placeholder="Imię i nazwisko *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="checkout-btn">
                  Potwierdź zamówienie ✅
                </button>
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Anuluj
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
