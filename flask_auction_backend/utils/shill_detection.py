import joblib
import numpy as np
import pandas as pd
from flask_auction_backend.models.bid import Bid

# Load the pre-trained model and scaler
_model = None
_scaler = None

def load_model():
    """
    Load the pre-trained machine learning model and the scaler.
    """
    global _model, _scaler
    if _model is None or _scaler is None:
        _model = joblib.load('flask_auction_backend/model/shill_bidding_model.pkl')
        _scaler = joblib.load('flask_auction_backend/model/scaler.pkl')

def detect_shill_bidding(bids):
    load_model()
    features = []

    # Check if there are any bids before processing
    if not bids:
        print("No bids found for this auction")
        return False  # No shill bidding detected if no bids are found

    for bid in bids:
        # Collect features for each bid
        record_id = bid.bid_id if bid.bid_id is not None else 0.0
        auction_id = bid.product_id if bid.product_id is not None else 0.0
        bidder_tendency = bid.bidder_tendency if bid.bidder_tendency is not None else 0.0
        bidding_ratio = bid.bidding_ratio if bid.bidding_ratio is not None else 0.0
        successive_outbidding = bid.successive_outbidding if bid.successive_outbidding is not None else 0.0
        last_bidding = bid.last_bidding.timestamp() if bid.last_bidding else 0.0
        auction_bids = bid.auction_bids if bid.auction_bids is not None else 0.0
        starting_price_average = bid.starting_price_average if bid.starting_price_average is not None else 0.0
        early_bidding = int(bid.early_bidding) if bid.early_bidding is not None else 0
        winning_ratio = bid.winning_ratio if bid.winning_ratio is not None else 0.0
        auction_duration = bid.auction_duration if bid.auction_duration is not None else 0.0

        features.append([
            record_id,
            auction_id,
            bidder_tendency,
            bidding_ratio,
            successive_outbidding,
            last_bidding,
            auction_bids,
            starting_price_average,
            early_bidding,
            winning_ratio,
            auction_duration
        ])

    # Use the exact feature names as used during training
    feature_names = [
        "Record_ID",
        "Auction_ID",
        "Bidder_Tendency",
        "Bidding_Ratio",
        "Successive_Outbidding",
        "Last_Bidding",
        "Auction_Bids",
        "Starting_Price_Average",
        "Early_Bidding",
        "Winning_Ratio",
        "Auction_Duration"
    ]
    
    # Create the DataFrame with proper column names
    X = pd.DataFrame(features, columns=feature_names)

    # Debugging: Print the full DataFrame to check that all features are populated
    print("Feature DataFrame before scaling:")
    print(X)  # Ensure that all columns are visible
    
    # Ensure the DataFrame isn't empty
    if X.empty:
        print("No valid features found for scaling.")
        return False  # No shill bidding detected if no valid features

    # Proceed only if data is valid
    try:
        X_scaled = _scaler.transform(X)  # Scale the features

        # Make the prediction
        prediction = _model.predict(X_scaled)

        # Check if shill bidding is detected (prediction == 1)
        return np.any(prediction == 1)
    except Exception as e:
        print(f"Error during scaling or prediction: {e}")
        return False
