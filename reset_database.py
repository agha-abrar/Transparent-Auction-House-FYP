from flask_auction_backend.app import app, db
from flask_auction_backend.models.user import User
from flask_auction_backend.models.product import Product
from flask_auction_backend.models.bid import Bid
from flask_auction_backend.models import user, product, bid  # Import your models

# Use a Flask app context to interact with the database
with app.app_context():
    try:
        # Drop all tables (this will delete all data)
        db.drop_all()
        print("All tables have been dropped.")

        # Create the tables again (this will recreate them according to your models)
        db.create_all()
        print("All tables have been recreated.")

    except Exception as e:
        print(f"An error occurred while resetting the database: {e}")
