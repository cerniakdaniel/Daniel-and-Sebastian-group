import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail({ products, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Produkt nie znaleziony 😢</h2>
          <button onClick={() => navigate('/')} className="back-btn">
            Powrót do produktów
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product);
    alert(`Dodano ${product.name} do koszyka!`);
  };

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Powrót
      </button>

      <div className="product-detail">
        <div className="product-image-section">
          <div className="product-icon-large">{product.image}</div>
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="product-origin">📍 Pochodzenie: {product.origin}</p>
          
          <div className="product-price-box">
            <span className="product-price-large">{product.price.toFixed(2)} €</span>
            <span className="product-unit">/ {product.unit}</span>
          </div>

          <div className="product-stock-info" style={{
            color: product.stock < 20 ? '#dc3545' : '#28a745',
            fontWeight: '600'
          }}>
            {product.stock > 0 
              ? `✓ W magazynie: ${product.stock} ${product.unit}` 
              : '✗ Brak w magazynie'
            }
          </div>

          <div className="product-description-box">
            <h3>Opis produktu</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <button
              className="add-to-cart-btn-large"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Brak w magazynie' : '🛒 Dodaj do koszyka'}
            </button>
            <button onClick={() => navigate('/cart')} className="go-to-cart-btn">
              Przejdź do koszyka
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
