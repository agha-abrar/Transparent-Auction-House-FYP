import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';
import Navbar from './Navbar';
import './AuctionDetailPage.css';

const AuctionDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    // 1) Load profile (buyer or seller) for the navbar
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem('seller_token') ||
          localStorage.getItem('buyer_token');
        if (!token) return;
        const { data } = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(data.username);
        setProfilePicture(data.profile_picture || 'default-profile.png');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    // 2) Load auction details + bids
    const fetchAuctionDetails = async () => {
      try {
        const { data } = await axios.get(`/auction/${productId}`);
        setAuction(data.auction);
        setBids(data.bids);
      } catch (err) {
        console.error('Error fetching auction details:', err);
      }
    };

    fetchProfile();
    fetchAuctionDetails();
  }, [productId]);

  if (!auction) return <div className="loading">Loading...</div>;

  return (
    <div className="auction-detail-page">
      <Navbar username={username} profilePicture={profilePicture} />

      <div className="auction-detail-container">
        {/* Auction Header */}
        <div className="auction-header">
          <h2 className="auction-title">{auction.name}</h2>
        </div>

        {/* Auction Image */}
        <img
          className="auction-image"
          src={`http://127.0.0.1:5000/static/${auction.image_url}`}
          alt={auction.name}
        />

        {/* Auction Info */}
        <div className="auction-info">
          <p><strong>Description:</strong> {auction.description}</p>
          <p><strong>Starting Price:</strong> ${auction.starting_price}</p>
          <p>
            <strong>Auction Ends:</strong>{' '}
            {new Date(auction.auction_end_time).toLocaleString()}
          </p>

          {auction.auction_status === 'completed' && auction.winner_name ? (
            <p className="auction-winner">
              <strong>Winner:</strong> {auction.winner_name}
            </p>
          ) : (
            <p className="auction-status">
              Auction is still active, no winner yet.
            </p>
          )}
        </div>

        {/* Bids Section */}
        <div className="bids-container">
          <h3>Bids</h3>
          {bids.length === 0 ? (
            <p>No bids placed yet.</p>
          ) : (
            bids.map((bid, idx) => (
              <div key={idx} className="bid-item">
                <div className="bid-header">
                  <span className="bid-username">{bid.username}</span>
                  <span className="bid-timestamp">
                    {new Date(bid.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="bid-amount">Bid: ${bid.amount}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
