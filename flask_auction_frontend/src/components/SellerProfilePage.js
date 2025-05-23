import React, { useState, useEffect } from 'react';
import axios from '../api';  // Axios instance
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';  
import './ProfilePage.css';  // We’ll tweak this file

const SellerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [createdAuctions, setCreatedAuctions] = useState([]);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('seller_token');
        const { data } = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        setUsername(data.username);
        setProfilePicture(data.profile_picture || 'default-profile.png');
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    const fetchCreated = async () => {
      try {
        const token = localStorage.getItem('seller_token');
        const { data } = await axios.get('/seller_auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCreatedAuctions(data);
      } catch (err) {
        console.error('Error fetching created auctions:', err);
      }
    };

    const fetchCompleted = async () => {
      try {
        const token = localStorage.getItem('seller_token');
        const { data } = await axios.get('/seller_completed_auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedAuctions(data);
      } catch (err) {
        console.error('Error fetching completed auctions:', err);
      }
    };

    fetchProfile();
    fetchCreated();
    fetchCompleted();
  }, []);

  const goAuction = id => navigate(`/auction/${id}`);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page-container">
      <Navbar username={username} profilePicture={profilePicture} />

      <div className="profile-main-content">
        {/* left column */}
        <div className="profile-left-section">
          <div className="profile-image-container">
            <img
              className="profile-image"
              src={`http://127.0.0.1:5000/static/${profile.profile_picture}`}
              alt="Profile"
            />
          </div>
          <h1 className="profile-title">{profile.username}</h1>
          <div className="profile-info">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Mobile:</strong> {profile.mobile_no}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </div>
        </div>

        {/* right column: two stacked sections */}
        <div className="profile-right-wrapper">
          
          {/* Created auctions */}
          <div className="profile-right-section">
            <h2>Auctions You’ve Created</h2>
            {createdAuctions.length === 0 ? (
              <p>You haven’t created any auctions yet.</p>
            ) : (
              <div className="profile-auctions-container">
                {createdAuctions.map(a => (
                  <div
                    key={a.product_id}
                    className="profile-auction-card"
                    onClick={() => goAuction(a.product_id)}
                  >
                    {a.image_url && (
                      <img
                        className="auction-card-image"
                        src={`http://127.0.0.1:5000/static/${a.image_url}`}
                        alt={a.name}
                      />
                    )}
                    <h3 className="auction-card-title">{a.name}</h3>
                    <p><strong>Starting Price:</strong> ${a.starting_price}</p>
                    <p><strong>Status:</strong> {a.auction_status}</p>
                    <p>
                      <strong>Auction Ends:</strong>{' '}
                      {new Date(a.auction_end_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed auctions */}
          <div className="profile-right-section">
            <h2>Completed Auctions</h2>
            {completedAuctions.length === 0 ? (
              <p>No completed auctions yet.</p>
            ) : (
              <div className="profile-auctions-container">
                {completedAuctions.map(a => (
                  <div
                    key={a.product_id}
                    className="profile-auction-card"
                    onClick={() => goAuction(a.product_id)}
                  >
                    {a.image_url && (
                      <img
                        className="auction-card-image"
                        src={`http://127.0.0.1:5000/static/${a.image_url}`}
                        alt={a.name}
                      />
                    )}
                    <h3 className="auction-card-title">{a.name}</h3>
                    <p><strong>Starting Price:</strong> ${a.starting_price}</p>
                    <p><strong>Status:</strong> {a.auction_status}</p>
                    <p>
                      <strong>Auction Ends:</strong>{' '}
                      {new Date(a.auction_end_time).toLocaleString()}
                    </p>
                    <p><strong>Winner:</strong> {a.winner_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
