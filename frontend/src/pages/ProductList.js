import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductList.css';

function ProductList({ products, onAddToCart, onRefresh }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
    }
  }, [products]);

  useEffect(() => {
    let filtered = [...products];

    // Wyszukiwanie
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sortowanie
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, sortOrder, products]);

  if (loading) {
    return <div className="loading">Ładowanie produktów...</div>;
  }

  return (
    <div className="product-list-page">
      <header className="page-header">
        <h1>🌍 Afrykańskie Owoce Tropikalne 🍍</h1>
        <p>Najświeższe owoce prosto z Afryki!</p>
      </header>

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

      <section className="products-section">
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="product-icon">{product.image}</div>
                  <h3>{product.name}</h3>
                  <p className="origin">📍 {product.origin}</p>
                  <p className="description">{product.description}</p>
                  <p className="price">{product.price.toFixed(2)} € / {product.unit}</p>
                </Link>
                <p className="stock" style={{color: product.stock < 20 ? '#dc3545' : '#28a745'}}>
                  W magazynie: {product.stock} {product.unit}
                </p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(product)}
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
    </div>
  );
}

export default ProductList;
