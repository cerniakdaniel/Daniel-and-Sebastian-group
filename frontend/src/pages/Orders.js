import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

function Orders({ orders, onRefresh }) {
  const navigate = useNavigate();

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-orders">
          <h2>📦 Brak zamówień</h2>
          <p>Nie masz jeszcze żadnych zamówień</p>
          <button onClick={() => navigate('/')} className="shop-now-btn">
            Zacznij zakupy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 Historia zamówień</h1>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Odśwież
        </button>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Zamówienie #{order.id}</h3>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'pending' ? 'Oczekujące' : 
                   order.status === 'completed' ? 'Zakończone' : 
                   order.status === 'cancelled' ? 'Anulowane' : order.status}
                </span>
              </div>
            </div>

            <div className="order-customer">
              <p><strong>Klient:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.email}</p>
              {order.phone && <p><strong>Telefon:</strong> {order.phone}</p>}
            </div>

            <div className="order-items">
              <h4>Produkty:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="item-price">
                    {item.price.toFixed(2)} € × {item.quantity}
                  </span>
                  <span className="item-total">
                    = {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <strong>Suma całkowita:</strong>
              <strong className="total-amount">{order.totalPrice.toFixed(2)} €</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
