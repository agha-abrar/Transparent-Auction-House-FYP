import React from 'react';
import logo from './auction.png';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa'; // Importing phone and email icons


import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      navigate('/admin/login');
    } else if (role === 'buyer') {
      navigate('/buyer/login');
    } else if (role === 'seller') {
      navigate('/seller/login');
    }
  };

  return (
    <div className="role-selection-container" id="home" >
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo-text">
          <span className="brand-text">AuctionX</span>
          <img src={logo} alt="Auction Icon" className="icon" />
        </div>
        <ul className="nav-links">
        <li><a href="#home">Home</a></li>
          <li><a href="#about-us">About Us</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact-us">Contact Us</a></li>

        </ul>
        
        <div className="auth-buttons">
          <button onClick={() => navigate('/signup')}>Sign Up</button>
          <button onClick={() => handleRoleSelect('admin')}>Admin</button>
          <button onClick={() => handleRoleSelect('buyer')}>Buyer</button>
          <button onClick={() => handleRoleSelect('seller')}>Seller</button>
        </div>
        
      </nav>

      {/* Optional Main Banner or Title */}
      <div className="role-selection-content">
        </div>
      
<div className="middle">
<div class="textt-container">
    <span class="textt">Where transparency and trust meet,</span>
    <span class="textt-auction">auctions happen.</span>
</div>

</div>
      {/* About Us Section */}
      <section id="about-us" className="section">
        <h2>About Us</h2>
        <p>Welcome to AuctionX, the transparent, secure, and trustworthy auction platform where buyers, sellers, and administrators come together to experience seamless online auctions. Our mission is simple — to provide a space where transactions are transparent, fair, and trustworthy, allowing everyone to feel confident in the auction process.

We are committed to making auctions simpler, more secure, and more accessible.</p>
      </section>

      {/* Services Section */}
     
      <section id="services" className="section">
    <h2>Our Services</h2>
    <p>At AuctionX, we provide a transparent, secure, and intuitive auction experience. With cutting-edge technology and a commitment to fair play, we offer the following services:</p>
    
    <ul class="services-list">
        <li><strong>1. Real-Time Bidding</strong>Participate in live, real-time auctions with instant updates. Never miss a bid!</li>
        <li><strong>2. AI-Powered Shill Bidding Detection</strong>AI-backed security ensures the integrity of every auction by detecting and preventing shill bidding. You can trust that every bid is legitimate.</li>
        <li><strong>3. Verified Listings</strong>Trustworthy auctions with verified sellers and authentic items.</li>
        <li><strong>4. Admin Dashboard</strong>Efficient management for administrators with real-time tracking and reporting.</li>
    </ul>
</section>

      {/* Contact Us Section */}
      <section id="contact-us" className="section">
      <h2>Contact Us</h2>
      <p>Feel free to reach out to us via the details below:</p>

      <div className="contact-info">
        {/* Phone Section */}
        <div className="contact-item">
          <FaPhoneAlt className="contact-icon" />
          <h3>Phone Number</h3>
          <p>+92 331 2419737</p>
        </div>

        {/* Email Section */}
        <div className="contact-item">
          <FaEnvelope className="contact-icon" />
          <h3>Email</h3>
          <p>lakshkumar.bscssef20@iba-suk.edu.pk</p>
          <p>supportauctionX@gmail.com</p>
        </div>
        <div className="contact-item">
        <a href="https://wa.me/923312419737" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp className="contact-icon" /></a>
          <h3>Whatsapp</h3>
          <p>+923312419737</p>
          
        </div>

      </div>
      </section>
    </div>
   
  );
};

export default RoleSelection;
