from flask_auction_backend.app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    auction_status = db.Column(db.String(20), default='active')  # e.g., "active", "completed"
    seller_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    image_url = db.Column(db.String(255))
    starting_price = db.Column(db.Float, nullable=True)
    auction_end_time = db.Column(db.DateTime, nullable=False)  # Auction end time (UTC)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Auction start time (UTC)
    winner_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    shill_detected = db.Column(db.Boolean, default=False)

    seller = db.relationship('User', foreign_keys=[seller_id], backref='products')
    winner = db.relationship('User', foreign_keys=[winner_id], backref='won_auctions')

    def __repr__(self):
        return f"<Product {self.name}>"

    def to_dict(self):
        """
        Convert the product object into a dictionary.
        You can expand this function to include other fields you want to return in your API response.
        """
        return {
            "product_id": self.product_id,
            "name": self.name,
            "description": self.description,
            "auction_status": self.auction_status,
            "starting_price": self.starting_price,
            "auction_end_time": self.auction_end_time.isoformat() if self.auction_end_time else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "image_url": self.image_url,
            "seller_id": self.seller_id,
            "winner_id": self.winner_id,
            "winner_name": self.winner.username if self.winner else None,  # Assuming the winner is a User object
        }
