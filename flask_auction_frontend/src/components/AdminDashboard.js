import React, { useState, useEffect } from 'react';
import axios from '../api';
import './AdminDashboard.css';
import Navbar from './AdminNavbar';

const AdminDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [activeTab, setActiveTab] = useState('auctions');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'auctions') {
          const auctionRes = await axios.get('/admin/view_auctions', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAuctions(auctionRes.data);

          const alertRes = await axios.get('/admin/detect_shill_bidding', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAlerts(alertRes.data.alerts);
        }

        if (activeTab === 'buyers') {
          const buyersRes = await axios.get('/admin/view_buyers', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBuyers(buyersRes.data);
        }

        if (activeTab === 'sellers') {
          const sellersRes = await axios.get('/admin/view_sellers', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSellers(sellersRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [activeTab, token]);

  const handleDisableAuction = async (productId) => {
    try {
      await axios.put(`/admin/manage_auction/${productId}?action=disable`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Auction ${productId} disabled.`);
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.product_id === productId
            ? { ...auction, auction_status: 'disabled' }
            : auction
        )
      );
    } catch (error) {
      alert('Failed to disable auction.');
    }
  };

  return (
    <>
      <Navbar setActiveTab={setActiveTab} />
      <div className="admin-dashboard">
        <div className="admin-dashboard-container">
          <h2>Admin Dashboard</h2>

          {activeTab === 'auctions' && (
            <>
              <div className="auctions-section">
                <h3>Auctions</h3>
                {auctions.length === 0 ? (
                  <p>No auctions available.</p>
                ) : (
                  <div className="auction-cards-container">
                    {auctions.map((auction) => (
                      <div key={auction.product_id} className="auction-card">
                        <img
                          src={`http://127.0.0.1:5000/${auction.image_url}`}
                          alt={auction.name}
                          className="auction-image"
                          onError={(e) => {
                            e.target.src = '/fallback.jpg';
                          }}
                        />

                        <div className="auction-details">
                          <h4>{auction.name}</h4>
                          <p>{auction.description}</p>
                          <p><strong>Status:</strong> {auction.auction_status}</p>
                          <p><strong>Price:</strong> ${auction.starting_price}</p>
                          <p><strong>Shill Detection:</strong> {auction.shill_detected ? 'True' : 'False'}</p>
                        <p><strong>End Time:</strong> {new Date(auction.auction_end_time).toLocaleString()}</p>
                          {auction.auction_status === 'active' ? (
                            <button className="disable-button" onClick={() => handleDisableAuction(auction.product_id)}>
                              Disable Auction
                            </button>
                          ) : (
                            <p style={{ color: 'gray' }}></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="alerts-section">
                <h3>Shill Bidding Alerts</h3>
                {alerts.length === 0 ? (
                  <p>No alerts.</p>
                ) : (
                  <ul>
                    {alerts.map((alert) => (
                      <li key={alert.product_id}>
                        <p>{alert.msg}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {activeTab === 'buyers' && (
            <div className="buyers-section">
              <h3>All Buyers</h3>
              {buyers.length === 0 ? (
                <p>No buyers found.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Mobile No</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((buyer) => (
                      <tr key={buyer.user_id}>
                        <td>{buyer.username}</td>
                        <td>{buyer.email}</td>
                        <td>{buyer.mobile_no}</td>
                        <td>{buyer.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'sellers' && (
            <div className="sellers-section">
              <h3>All Sellers</h3>
              {sellers.length === 0 ? (
                <p>No sellers found.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Mobile No</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller) => (
                      <tr key={seller.user_id}>
                        <td>{seller.username}</td>
                        <td>{seller.email}</td>
                        <td>{seller.mobile_no}</td>
                        <td>{seller.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
