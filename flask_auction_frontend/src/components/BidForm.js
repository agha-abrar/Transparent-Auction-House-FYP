import React, { useState } from 'react';
import axios from '../api';
import './BidForm.css'

const BidForm = ({ productId, refreshBids }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    // Validate bid amount
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }
    setError('');
    setIsLoading(true);

    const token = localStorage.getItem('buyer_token');
    try {
      await axios.post(
        '/submit_bid',
        { product_id: productId, bid_amount: bidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Bid placed successfully!");
      setBidAmount('');
      if (refreshBids) refreshBids();
    } catch (err) {
      console.error("Error placing bid:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Error placing bid!");
    }
    setIsLoading(false);
  };

  return (
    <div className="ssignup-container">
    <form onSubmit={handleBidSubmit} style={{ marginTop: '10px' }}>
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Enter your bid"
        style={{ padding: '5px', marginRight: '5px' }}
      />
      <button type="submit" style={{ padding: '5px 10px' }} disabled={isLoading}>
        {isLoading ? 'Placing Bid...' : 'Place Bid'}
      </button>
      {error && (
        <div style={{ color: 'white', marginTop: '5px' }}>
          {error}
        </div>
      )}
    </form>
    </div>
  );
};

export default BidForm;
