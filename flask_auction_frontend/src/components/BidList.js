// BidList.js
import React, { useState, useEffect } from 'react';
import axios from '../api';

// Helper to format any ISO timestamp into GMT+5
const formatToGMT5 = (isoString) => {
  const dt = new Date(isoString);
  return dt.toLocaleString('en-GB', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const BidList = ({ productId, refreshBidsFlag }) => {
  const [bids, setBids] = useState([]);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('buyer_token') || localStorage.getItem('seller_token');
      const response = await axios.get(`/get_bids/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBids(response.data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [productId, refreshBidsFlag]);

  const latestBids = bids.slice(-2);

  return (
    <div className="bid-list" style={{ marginTop: '2px', fontSize: '0.9rem',color: 'white' }}>
      <h4>Bids:</h4>
      {bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        <>
          <ul style={{ paddingLeft: '20px' }}>
            {latestBids.map((bid) => (
              <li key={bid.bid_id}>
                <strong>{bid.username}</strong>: ${bid.bid_amount} at {formatToGMT5(bid.timestamp)}
              </li>
            ))}
          </ul>
          {bids.length > 2 && (
            <button
              style={{
                color: '#ffd700',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                marginTop: '10px'
              }}
              onClick={() => window.location.href = `/auction/${productId}`}
            >
              View All Bids
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default BidList;
