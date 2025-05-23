from flask_auction_backend.app import db

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='buyer')
    
    # New fields
    mobile_no = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)  # Stores relative path (e.g., "profile_pics/filename.jpg")
    cnic_number = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return f"<User {self.username}>"
