// SellerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from '../api';  // Axios instance
import { useNavigate } from 'react-router-dom';
import CreateAuction from './CreateAuction';
import Navbar from './Navbar';  // Shared Navbar
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('default-profile.png');
  const navigate = useNavigate();

  // Format ISO date string to local
  const formatEndTime = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // 1) Fetch profile (username + picture)
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('seller_token');
      if (!token) return;
      const { data } = await axios.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(data.username);
      setProfilePicture(data.profile_picture || 'default-profile.png');
    } catch (err) {
      console.error('Error fetching seller profile:', err);
    }
  };

  // 2) Fetch seller’s auctions
  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('seller_token');
      if (!token) return;
      const { data } = await axios.get('/seller_auctions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(data);
    } catch (err) {
      console.error('Error fetching seller auctions:', err);
    }
  };

  // On mount, load profile then auctions
  useEffect(() => {
    (async () => {
      await fetchProfile();
      await fetchAuctions();
    })();
  }, []);

  return (
    <div className="selller-dashboard">
      {/* Pass real picture + name to Navbar */}
      <Navbar username={username} profilePicture={profilePicture} />

      {/* shift content below fixed navbar */}

        {/* New auction form */}
        <CreateAuction refreshAuctions={fetchAuctions} />

        {/* Auction cards */}
        <div className="auction-cards-container">
          {auctions.length === 0 ? (
            <p>No active auctions right now.</p>
          ) : (
            auctions.map((a) => (
              <div className="auction-card" key={a.product_id}>
                {a.image_url && (
                  <img
                    src={`http://127.0.0.1:5000/static/${a.image_url}`}
                    alt={a.name}
                    className="auction-image"
                  />
                )}
                <div className="auction-card-content">
                  <h3>{a.name}</h3>
                  <p>{a.description}</p>
                  <p>Starting Price: ${a.starting_price}</p>
                  <p>Status: {a.auction_status}</p>
                  <p>Auction Ends: {formatEndTime(a.auction_end_time)}</p>
                  {a.auction_status === 'completed' && a.winner_name && (
                    <p>Winner: {a.winner_name}</p>
                  )}
                  {a.bids && a.bids.length > 0 ? (
                    <>
                      <h4>Bids Placed:</h4>
                      {a.bids.map((b, i) => (
                        <p key={i}>
                          {b.username} bid ${b.bid_amount} at{' '}
                          {new Date(b.timestamp).toLocaleString()}
                        </p>
                      ))}
                    </>
                  ) : (
                    <p>No bids yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    
  );
};

export default SellerDashboard;
