// frontend/src/components/SellerLogin.js
import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import './SellerLogin.css'; // your existing CSS

const SellerLogin = ({ setSellerToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password });
      const { access_token, role } = response.data;
      if (role !== 'seller') {
        alert("This account is not registered as a Seller. Please use the correct login page.");
        return;
      }
      localStorage.setItem('seller_token', access_token);
      setSellerToken && setSellerToken(access_token);
      alert("Seller login successful!");
      navigate("/seller/dashboard");
    } catch (error) {
      console.error(error);
      alert("Seller login failed!");
    }
  };

  return (
    <div className="buyer-login-background">
    <div className="buyer-login-container">
      <h2>Seller Login</h2>
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
        <button type="submit">Login as Seller</button>
      </form>
      <div className="nav-buttons">
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        <button onClick={() => navigate("/buyer/login")}>Login as Buyer</button>
        <button onClick={() => navigate("/admin/login")}>Login for Admin</button>
      </div>
</div>
    </div>
  );
};

export default SellerLogin;
