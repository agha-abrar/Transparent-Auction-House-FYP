import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from './auction.png';
const Navbar = ({ username, profilePicture }) => {
  const navigate = useNavigate();

  // Handle Logout Logic
  const handleLogout = () => {
    const sellerToken = localStorage.getItem('seller_token');
    const buyerToken = localStorage.getItem('buyer_token');
    
    if (sellerToken) {
      navigate("/seller/login"); // Redirect seller to seller login page
    } else if (buyerToken) {
      navigate("/buyer/login"); // Redirect buyer to buyer login page
    } else {
      navigate("/login"); // Redirect to default login if no token
    }

    // Remove tokens from localStorage on logout
    localStorage.removeItem('buyer_token');
    localStorage.removeItem('seller_token');
  };

  // Profile Button Click Logic
  const handleProfileClick = () => {
    const sellerToken = localStorage.getItem('seller_token');
    const buyerToken = localStorage.getItem('buyer_token');
    
    if (sellerToken) {
      // If seller is logged in, route to SellerProfilePage
      navigate('/seller/profile');
    } else if (buyerToken) {
      // If buyer is logged in, route to ProfilePage
      navigate('/profile');
    } else {
      // If no user is logged in, route to login page
      navigate('/login');
    }
  };

  // Home Button Logic
  const handleHomeClick = () => {
    const sellerToken = localStorage.getItem('seller_token');
    const buyerToken = localStorage.getItem('buyer_token');
    if (sellerToken) {
      navigate('/seller/dashboard'); // Redirect to Seller Dashboard
    } else if (buyerToken) {
      navigate('/buyer/dashboard'); // Redirect to Buyer Dashboard
    } else {
      navigate('/'); // Redirect to Home
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleHomeClick}>
        <span className='brand-text'>AuctionX</span>
                  <img src={logo} alt="Auction Icon" className="icon" />
                
      </div>
      

      <ul className="nav-links">
        <li>
        <a href="#" className="nav-link" onClick={handleHomeClick}>Home</a>

        </li>
        <li>
        
        < a  href="/auctions"> Auctions</a></li>
        <li>
        < a  href="/auctions"> Active Auctions</a>
        

    

    </li>
        
        
      </ul>

      <div className="profile-container">
        <h3>Welcome {username}</h3>
        <div className="profile-button" onClick={handleProfileClick}>
          {profilePicture ? (
            <img
              src={`http://127.0.0.1:5000/static/${profilePicture}`}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <img
              src="http://127.0.0.1:5000/static/default-profile.png"
              alt="Profile"
              className="profile-image"
            />
          )}
          
        </div>
        <button className="log-buttons" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
