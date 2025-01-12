import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import StockList from './StockList';
import AddEditStock from './AddEditStock';
import { LoginForm } from './Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stocks" element={<StockList />} />
        <Route path="/add-stock" element={<AddEditStock />} />
        <Route path="/edit-stock/:id" element={<AddEditStock />} />
      </Routes>
    </Router>
  );
}

export default App;
