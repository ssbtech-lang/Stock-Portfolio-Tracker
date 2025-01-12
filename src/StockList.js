import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockList.css';

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Ensure useNavigate is being used correctly

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setStocks(data);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setError('Failed to fetch stocks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleAddStock = () => {
    console.log('Add New Stock button clicked');
    navigate('/add-stock'); // Ensure correct path for the navigation
  };

  const handleGoToDashboard = () => {
    console.log('Go to Dashboard button clicked');
    navigate('/add-stock'); // Correct path for dashboard navigation
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="stock-list-container">
      <div className="stock-overview">Stock Overview</div>
      <div className="marquee">
        "Trade smart, seize the opportunity! The stock market is full of potential – Invest wisely for a prosperous future!"
      </div>

      <table>
        <thead>
          <tr>
            <th>Name (Symbol)</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {stocks.length > 0 ? (
            stocks.map((stock) => (
              <tr key={stock._id}>
                <td>
                  {stock.name} ({stock.symbol})
                </td>
                <td>${stock.price?.toFixed(2)}</td>
                <td>{stock.quantity}</td>
                <td>${(stock.price * stock.quantity).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No stocks available.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="button-container">
        <button onClick={handleAddStock}>"Trade smart, grow rich—where strategy meets opportunity in the stock market!"</button>
        <button onClick={handleGoToDashboard}>Modify Stocks</button>
      </div>
    </div>
  );
}

export default StockList;
