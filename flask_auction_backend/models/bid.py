from flask_auction_backend.app import db
from datetime import datetime

class Bid(db.Model):
    __tablename__ = 'bids'
    bid_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    bid_amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # Use UTC time

    # Additional fields for shill bidding detection
    bidder_tendency = db.Column(db.Float, nullable=True)
    bidding_ratio = db.Column(db.Float, nullable=True)
    successive_outbidding = db.Column(db.Integer, nullable=True)
    last_bidding = db.Column(db.DateTime, nullable=True)
    auction_bids = db.Column(db.Float, nullable=True)
    starting_price_average = db.Column(db.Float, nullable=True)
    early_bidding = db.Column(db.Boolean, nullable=True)
    winning_ratio = db.Column(db.Float, nullable=True)
    auction_duration = db.Column(db.Float, nullable=True)

    # Define relationships
    product = db.relationship('Product', backref='bids')  # For accessing Product data related to a bid
    user = db.relationship('User', backref='bids')  # For accessing User data related to a bid

    def __repr__(self):
        return f"<Bid {self.bid_amount} for Product {self.product_id}>"
