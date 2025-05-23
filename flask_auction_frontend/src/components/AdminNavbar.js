import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminNavbar.css';
import logo from './auction.png';

const AdminNavbar = ({ setActiveTab }) => {
  const navigate = useNavigate();

  // Handle navigation and tab switching
  const handleTabClick = (tab) => {
    setActiveTab(tab); // Update the active tab state
    if (tab === 'auctions') {
      navigate('/admin/dashboard'); // Ensure the URL matches your dashboard route
    } else if (tab === 'buyers') {
      navigate('/admin/dashboard'); // Update this if you have a specific route for buyers
    } else if (tab === 'sellers') {
      navigate('/admin/dashboard'); // Update this if you have a specific route for sellers
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token'); // Clear the token
    navigate('/admin/login'); // Navigate to the admin login page
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/admin/dashboard')}>
        <span className='brand-text'>AuctionX</span>
        <img src={logo} alt="Auction Icon" className="icon" />
      </div>

      <ul className="nav-links">
        <li>
          <a href="#" onClick={() => handleTabClick('auctions')} className="nav-link">View Auctions</a>
        </li>
        <li>
          <a href="#" onClick={() => handleTabClick('buyers')} className="nav-link">View All Buyers</a>
        </li>
        <li>
          <a href="#" onClick={() => handleTabClick('sellers')} className="nav-link">View All Sellers</a>
        </li>
      </ul>

      {/* Logout Button */}
      <div className="profile-container">
        <button className="log-buttons" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
