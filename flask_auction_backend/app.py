# flask_auction_backend/app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_auction_backend.config import Config
from flask_mail import Mail, Message

app = Flask(__name__, static_folder='static')


CORS(app)
app.config.from_object(Config)
mail = Mail(app)

# Initialize a single SQLAlchemy instance
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Import models so that they are registered with SQLAlchemy
from flask_auction_backend.models.user import User
from flask_auction_backend.models.product import Product
from flask_auction_backend.models.bid import Bid

# Import and register blueprints for API routes
from flask_auction_backend.routes.auth import auth_bp
from flask_auction_backend.routes.admin import admin_bp
from flask_auction_backend.routes.auction import auction_bp
from flask_auction_backend.routes.bidding import bidding_bp
from apscheduler.schedulers.background import BackgroundScheduler
from flask_auction_backend.routes.auction import check_auctions



app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auction_bp)
app.register_blueprint(bidding_bp)

print(f"SECRET_KEY is: {app.config['SECRET_KEY']}")



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Tables created successfully!")
    app.run(debug=True)
