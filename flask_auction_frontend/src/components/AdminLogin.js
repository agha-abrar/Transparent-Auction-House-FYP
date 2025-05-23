import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/admin/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('admin_token', access_token);
      alert("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login failed:", error.response?.data || error.message);
      alert(error.response?.data?.msg || "Invalid admin credentials!");
    }
  };

  return (
    <div className="adminlogin-background">
      <div className="adminlogin-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login as Admin</button>
        </form>

        <Link to="/admin/forgot-password" className="forgot">
          Forgot Password?
        </Link>

        <Link to="/" className="nav-button-link">
          <span className="home-link-content">
            <FaHome className="home-icon" />
            Home
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
