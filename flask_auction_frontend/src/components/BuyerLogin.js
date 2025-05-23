// frontend/src/components/BuyerLogin.js
import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import './BuyerLogin.css'; // your existing CSS
import { Link } from 'react-router-dom';

const BuyerLogin = ({ setBuyerToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password });
      const { access_token, role } = response.data;
      if (role !== 'buyer') {
        alert("This account is not registered as a Buyer. Please use the correct login page.");
        return;
      }
      localStorage.setItem('buyer_token', access_token);
      setBuyerToken && setBuyerToken(access_token);
      alert("Buyer login successful!");
      navigate("/buyer/dashboard");
    } catch (error) {
      console.error(error);
      alert("Buyer login failed!");
    }
  };

  return (
    <div className="buyer-login-background">
    <div className="buyer-login-container">
      <h2>Buyer Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Link to="/buyer/forgot-password" className="forgot">
          Forgot Password?
        </Link>
        <button type="submit">Login as Buyer</button>
      </form>
      <div className="nav-buttons">
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        <button onClick={() => navigate("/seller/login")}>Login as Seller</button>
        <button onClick={() => navigate("/admin/login")}>Login for Admin</button>
      </div>
  </div>
    </div>
  );
};

export default BuyerLogin;
