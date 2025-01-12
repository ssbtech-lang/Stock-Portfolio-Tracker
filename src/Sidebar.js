import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // You can add your custom styles for the sidebar here

function Sidebar() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-item" onClick={() => handleNavigation('/Dashboard')}>
        <span>Dashboard</span>
      </div>
      <div className="sidebar-item" onClick={() => handleNavigation('/stocks')}>
        <span>Stock List</span>
      </div>
      <div className="sidebar-item" onClick={() => handleNavigation('/add-stock')}>
        <span>Modify Stocks</span>
      </div>
    </div>
  );
}

export default Sidebar;
