// CreateAuction.js
import React, { useState } from 'react';
import axios from '../api';
import './CreateAuction.css';
const CreateAuction = ({ refreshAuctions }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [auctionEndTime, setAuctionEndTime] = useState('');  // New state for auction end time
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the inputs
    if (!name || !description || !startingPrice || !auctionEndTime) {
      setError("Please fill in all the required fields!");
      return;
    }
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('starting_price', startingPrice);
    formData.append('auction_end_time', auctionEndTime);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('seller_token');
      const response = await axios.post('/create_auction', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.msg);
      refreshAuctions();  // Refresh the auctions list
    } catch (error) {
      console.error('Error creating auction:', error.response?.data || error.message);
      alert('Error creating auction');
    }
    setIsLoading(false);
  };

  return (
    <div className="signuo-background">
    <div className="signup-container">
    <form onSubmit={handleSubmit}>
    
      
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      
        <label>Starting Price</label>
        <input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} required />
      
        <label>Auction End Time</label>
        <input type="datetime-local" value={auctionEndTime} onChange={(e) => setAuctionEndTime(e.target.value)} required />
      
        <label>Image</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
    
    
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Auction...' : 'Create Auction'}
      </button>
      
    </form>
    </div>
    </div>
  );
};

export default CreateAuction;
