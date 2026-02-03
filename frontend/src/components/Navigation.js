import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation({ cartItemsCount }) {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🌍 Afrykańskie Owoce
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 Produkty
          </Link>
          <Link 
            to="/orders" 
            className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            📦 Zamówienia
          </Link>
          <Link 
            to="/cart" 
            className={`nav-link cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            🛒 Koszyk
            {cartItemsCount > 0 && (
              <span className="cart-count">{cartItemsCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
