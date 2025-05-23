// BuyerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BidForm from './BidForm';
import BidList from './BidList';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('default-profile.png');
  const [refreshBidsFlag, setRefreshBidsFlag] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('buyer_token');
      const { data } = await axios.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(data.username);
      setProfilePicture(data.profile_picture || 'default-profile.png');
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch auctions with optional search query
  const fetchAuctions = async (searchQuery = '') => {
    try {
      const token = localStorage.getItem('buyer_token');
      const { data } = await axios.get('/running_auctions', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchQuery },
      });
      setAuctions(data);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    }
  };

  // Check for completed auctions
  const checkAuctions = async () => {
    try {
      const token = localStorage.getItem('buyer_token');
      await axios.get('/check_auctions', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error checking auctions:', err);
    }
  };

  // Get query param for search
  const getSearchQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('query') || '';
  };

  useEffect(() => {
    fetchProfile();
    checkAuctions();
  }, []);

  useEffect(() => {
    const searchQuery = getSearchQuery();
    fetchAuctions(searchQuery);
  }, [location]);

  const refreshBids = () => setRefreshBidsFlag(f => !f);
  const handleLogout = () => {
    localStorage.removeItem('buyer_token');
    navigate('/buyer/login');
  };

  const formatEndTime = endTimeStr => {
    if (!endTimeStr) return 'N/A';
    const d = new Date(endTimeStr);
    return isNaN(d) ? 'Invalid Date' : d.toLocaleString();
  };

  return (
    <div className="buyer-dashboard">
      <Navbar
        username={username}
        profilePicture={profilePicture}
        onLogout={handleLogout}
      />

      <div className="auction-cards-container">
        {auctions.length === 0 ? (
          <p>No auctions found for your search.</p>
        ) : auctions.map(a => (
          <div className="auction-card" key={a.product_id}>
            {a.image_url && (
              <img
                src={`http://127.0.0.1:5000/static/${a.image_url}`}
                alt={a.name}
                onClick={() => navigate(`/auction/${a.product_id}`)}
                style={{ cursor: 'pointer' }}
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
            </div>
            <BidForm productId={a.product_id} refreshBids={refreshBids} />
            <BidList productId={a.product_id} refreshBidsFlag={refreshBidsFlag} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerDashboard;
