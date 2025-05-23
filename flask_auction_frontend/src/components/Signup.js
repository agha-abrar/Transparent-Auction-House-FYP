// frontend/src/components/Signup.js
import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
 // Assuming CSS file is here




const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Prepare FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('mobile_no', mobileNo);
      formData.append('address', address);
      formData.append('cnic_number', cnicNumber);
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      
      const response = await axios.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.msg);
      // Navigate to the corresponding login page based on role
      if (role === 'buyer') {
        navigate('/buyer/login');
      } else {
        navigate('/seller/login');
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Signup failed!");
    }
  };

  return (
    <div className="signup-background">
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="text"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="Mobile Number"
          required
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
        />
        <input
          type="text"
          value={cnicNumber}
          onChange={(e) => setCnicNumber(e.target.value)}
          placeholder="CNIC Number"
          required
        />
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
      <div className="nav-buttons">
        <button onClick={() => navigate("/buyer/login")}>Login as Buyer</button>
        <button onClick={() => navigate("/seller/login")}>Login as Seller</button>
        <button onClick={() => navigate("/admin/login")}>Login for Admin</button>

      </div>
    </div>
    </div>
  );
};

export default Signup;
