// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from '../api';  // Your configured axios instance
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [userAuctionsBid, setUserAuctionsBid] = useState([]);   // Auctions user placed bids on
  const [userAuctionsWon, setUserAuctionsWon] = useState([]);   // Auctions user has won
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1) fetch profile info
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('buyer_token');
        const { data } = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(data);
        setUsername(data.username);
        setProfilePicture(data.profile_picture || 'default-profile.png');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    // 2) fetch auctions bid on
    const fetchUserAuctionsBid = async () => {
      try {
        const token = localStorage.getItem('buyer_token');
        const { data } = await axios.get('/user_auctions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // remove duplicates by product_id
        const unique = Array.from(
          new Map(data.map(a => [a.product_id, a])).values()
        );
        setUserAuctionsBid(unique);
      } catch (err) {
        console.error('Error fetching bids:', err);
      }
    };

    // 3) fetch auctions won
    const fetchUserAuctionsWon = async () => {
      try {
        const token = localStorage.getItem('buyer_token');
        const { data } = await axios.get('/user_auctions_won', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserAuctionsWon(data);
      } catch (err) {
        console.error('Error fetching won auctions:', err);
      }
    };

    fetchProfile();
    fetchUserAuctionsBid();
    fetchUserAuctionsWon();
  }, []);

  const handleAuctionClick = (id) => navigate(`/auction/${id}`);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page-container">
      <Navbar username={username} profilePicture={profilePicture} />

      <div className="profile-main-content">
        <div className="profile-left-section">
          <div className="profile-image-container">
            <img
              className="profile-image"
              src={`http://127.0.0.1:5000/static/${profile.profile_picture || 'default-profile.png'}`}
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

        <div className="profile-right-section">
          <h2>Auctions You've Placed Bid On</h2>
          {userAuctionsBid.length === 0 ? (
            <p>You haven't placed any bids yet.</p>
          ) : (
            <div className="profile-auctions-container">
              {userAuctionsBid.map(auction => (
                <div
                  key={auction.product_id}
                  className="profile-auction-card"
                  onClick={() => handleAuctionClick(auction.product_id)}
                >
                  {auction.image_url && (
                    <img
                      className="auction-card-image"
                      src={`http://127.0.0.1:5000/static/${auction.image_url}`}
                      alt={auction.name}
                    />
                  )}
                  <h3 className="auction-card-title">{auction.name}</h3>
                  <p><strong>Starting Price:</strong> ${auction.starting_price}</p>
                  <p><strong>Status:</strong> {auction.auction_status}</p>
                  <p>
                    <strong>Auction Ends:</strong>{' '}
                    {new Date(auction.auction_end_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-right-section">
          <h2>Auctions You've Won</h2>
          {userAuctionsWon.length === 0 ? (
            <p>You haven't won any auctions yet.</p>
          ) : (
            <div className="profile-auctions-container">
              {userAuctionsWon.map(auction => (
                <div
                  key={auction.product_id}
                  className="profile-auction-card"
                  onClick={() => handleAuctionClick(auction.product_id)}
                >
                  {auction.image_url && (
                    <img
                      className="auction-card-image"
                      src={`http://127.0.0.1:5000/static/${auction.image_url}`}
                      alt={auction.name}
                    />
                  )}
                  <h3 className="auction-card-title">{auction.name}</h3>
                  <p><strong>Starting Price:</strong> ${auction.starting_price}</p>
                  <p><strong>Status:</strong> {auction.auction_status}</p>
                  <p>
                    <strong>Auction Ends:</strong>{' '}
                    {new Date(auction.auction_end_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
