import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileButton.css';  // Ensure the CSS is properly linked

const ProfileButton = ({ username, profilePicture }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="profile-button" onClick={handleProfileClick}>
      {profilePicture ? (
        <img
          src={`http://127.0.0.1:5000/static/${profilePicture}`}
          alt="Profile"
        />
      ) : (
        <img
          src="http://127.0.0.1:5000/static/default-profile.png"
          alt="Profile"
        />
      )}
      <span>{username}</span>
    </div>
  );
};

export default ProfileButton;
