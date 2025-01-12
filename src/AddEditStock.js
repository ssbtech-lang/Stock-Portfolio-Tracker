import React, { useState, useEffect } from 'react';
import './AddEditStock.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEditStock = () => {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch stocks.');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const stock = { symbol, name, price: parseFloat(price), quantity: parseInt(quantity, 10) };

    try {
      const response = await fetch('http://localhost:3001/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });

      if (!response.ok) {
        throw new Error('Failed to add stock');
      }

      toast.success('Stock added successfully!');
      fetchStocks();
      resetForm();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Error adding stock.');
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    const stock = { quantity: parseInt(quantity, 10) };

    try {
      const response = await fetch(`http://localhost:3001/api/portfolio/${editingStockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      toast.success('Stock updated successfully!');
      fetchStocks();
      resetForm();
    } catch (error) {
      console.error('Error editing stock:', error);
      toast.error('Error updating stock.');
    }
  };

  const handleDelete = async (stockId) => {
    if (!window.confirm('Are you sure you want to delete this stock?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/portfolio/${stockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete stock');
      }

      toast.success('Stock deleted successfully!');
      fetchStocks();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Error deleting stock.');
    }
  };

  const startEditing = (stock) => {
    setEditingStockId(stock._id);
    setSymbol(stock.symbol);
    setName(stock.name);
    setPrice(stock.price);
    setQuantity(stock.quantity);
  };

  const resetForm = () => {
    setSymbol('');
    setName('');
    setPrice('');
    setQuantity('');
    setEditingStockId(null);
  };

  return (
    <div className="add-stock-container">
      {/* Left side: Stocks List Table */}
      <div className="stocks-list-section">
        <h1>Available Stock List</h1>
        <table className="stocks-table">
          <thead>
            <tr>
              <th>Stock Name (Symbol)</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="5">No stocks available</td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock._id}>
                  <td>{stock.name} ({stock.symbol})</td>
                  <td>${stock.price?.toFixed(2)}</td>
                  <td>{stock.quantity}</td>
                  <td>${(stock.price * stock.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => startEditing(stock)}>Edit</button>
                    <button onClick={() => handleDelete(stock._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Right side: Add/Edit Stock Form */}
      <div className="form-container">
        {editingStockId ? (
          <>
            <h2>Edit Stock</h2>
            <form onSubmit={handleEditStock}>
              <input type="text" value={symbol} disabled placeholder="Symbol" />
              <input type="text" value={name} disabled placeholder="Name" />
              <input type="number" value={price} disabled placeholder="Price" />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <button type="submit">Update Stock</button>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Add Stock</h2>
            <form onSubmit={handleAddStock}>
              <input
                type="text"
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <button type="submit">Add Stock</button>
            </form>
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default AddEditStock;
