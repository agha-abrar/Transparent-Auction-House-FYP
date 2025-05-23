import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';  // Import useNavigate and useParams from react-router-dom
import axios from '../api';  // Ensure the path to axios is correct
import './ResetPassword.css';  // Import your CSS file

const ResetPassword = () => {
  const { token } = useParams();  // Retrieve the reset token from URL params
  const navigate = useNavigate();  // Use useNavigate for routing
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Optional: You can validate the token here (e.g., check if it exists or expired)
    // This is just an example of how to check the token on mount.
    // axios.get(`/api/reset-token-validation/${token}`).then(response => console.log(response));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      // Make the request to the backend to reset the password
      const response = await axios.post(`/admin/reset-password/${token}`, {
        new_password: newPassword,
      });

      // On success, display a success message
      setSuccessMessage('Your password has been successfully reset!');
      setErrorMessage('');
      setTimeout(() => {
        navigate('/admin/login');  // Redirect to login page after 3 seconds
      }, 3000);
    } catch (error) {
      // Handle error and display a message
      setErrorMessage('Error resetting password. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2>Reset Password</h2>

        {/* Display error or success message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
