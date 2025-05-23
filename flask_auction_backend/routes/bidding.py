from datetime import datetime
import os
import traceback
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_auction_backend.models.bid import Bid, db
from flask_auction_backend.models.product import Product
from flask_auction_backend.models.user import User
import pytz


bidding_bp = Blueprint('bidding_bp', __name__, url_prefix='/api')

# ----- Helper functions -----

def convert_to_gmt_plus_5(utc_time):
    """Convert UTC time to GMT+5."""
    gmt_plus_5 = pytz.timezone('Asia/Karachi')  # GMT+5 timezone
    return utc_time.astimezone(gmt_plus_5)  # Convert to GMT+5

def compute_bidding_ratio(product_id, current_bid):
    try:
        current_bid = float(current_bid)
    except ValueError:
        return 1.0  # Fallback value if conversion fails

    last_bid = Bid.query.filter_by(product_id=product_id).order_by(Bid.timestamp.desc()).first()
    if last_bid and last_bid.bid_amount:
        return current_bid / float(last_bid.bid_amount)
    return 1.0

def compute_successive_outbidding(buyer_id, product_id):
    bids = Bid.query.filter_by(product_id=product_id, user_id=buyer_id).order_by(Bid.timestamp.desc()).all()
    return len(bids)

def compute_bidder_tendency(buyer_id):
    # Retrieve all bids placed by the buyer.
    buyer_bids = Bid.query.filter_by(user_id=buyer_id).all()    
    if not buyer_bids:
        return 0.0
    auction_ids = {bid.product_id for bid in buyer_bids}    
    avg_bids_per_auction = len(buyer_bids) / len(auction_ids)
    baseline = 10.0  # adjust as needed
    tendency = avg_bids_per_auction / baseline    
    return min(tendency, 1.0)
def compute_winning_ratio(buyer_id, product_id):
    # Get the product by product_id
    product = Product.query.get(product_id)

    # If the product is found and the product has a winner
    if product:
        # Check if the product has a winner and if the buyer is the winner
        if product.winner_id == buyer_id:
            total_bids = Bid.query.filter_by(product_id=product_id).count()
            if total_bids == 0:
                return 0.0  # No bids placed, so return 0.0

            # Count how many bids the buyer has placed on this product
            winning_bids = Bid.query.filter_by(product_id=product_id, user_id=buyer_id).count()
            return winning_bids / total_bids  # Return the winning ratio
        else:
            return 0.0  # If buyer is not the winner, return 0.0
    else:
        return 0.0  # If the product is not found, return 0.0

def compute_auction_duration(product_id):
    product = Product.query.filter_by(product_id=product_id).first()
    if not product or not product.auction_end_time:
        return 60.0  # Default duration in minutes if no duration available
    # Assuming product.created_at holds the auction start time.
    duration = (product.auction_end_time - product.created_at).total_seconds() / 3600.0  # in minutes
    return duration

def compute_starting_price_average(product_id):
    from flask_auction_backend.models.product import Product
    product = Product.query.filter_by(product_id=product_id).first()
    if not product or product.starting_price is None:
        print("No starting price for product_id:", product_id)
        return 0.0

    # Ensure seller_id is an integer literal.
    try:
        seller_id = int(product.seller_id)
    except Exception as e:
        print("Error converting seller_id to int for product_id:", product_id, "->", e)
        seller_id = product.seller_id

    seller_products = Product.query.filter(
        Product.seller_id == seller_id,
        Product.starting_price.isnot(None)
    ).all()

    if not seller_products:
        return product.starting_price

    avg_price = sum(p.starting_price for p in seller_products) / len(seller_products)
    print("Computed starting_price_average for seller", seller_id, ":", avg_price)
    return avg_price

def compute_early_bidding(buyer_id, product_id):
    # Simple flag: if fewer than 5 bids have been placed in the auction, mark as early bidding.
    auction_bid_count = Bid.query.filter_by(product_id=product_id).count()
    return 1 if auction_bid_count < 5 else 0

# ----- End Helper functions -----

@bidding_bp.route('/submit_bid', methods=['POST'])
@jwt_required()
def submit_bid():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        bid_amount = data.get('bid_amount')
        
        if not product_id or not bid_amount:
            return jsonify({"msg": "product_id and bid_amount are required"}), 400

        try:
            bid_amount = float(bid_amount)
        except ValueError:
            return jsonify({"msg": "bid_amount must be a number"}), 400

        # Check if the auction is still active
        auction = Product.query.get(product_id)
        if not auction or auction.auction_status != 'active':
            return jsonify({"msg": "This auction is no longer active."}), 400

        buyer_id = int(get_jwt_identity())

        # Get the current UTC time and convert it to GMT+5
        utc_timestamp = datetime.utcnow().replace(tzinfo=pytz.utc)
        gmt_plus_5_timestamp = convert_to_gmt_plus_5(utc_timestamp)

        # Compute additional bid features using helper functions
        bidding_ratio = compute_bidding_ratio(product_id, bid_amount)
        successive_outbidding = compute_successive_outbidding(buyer_id, product_id)
        last_bid = Bid.query.filter_by(product_id=product_id, user_id=buyer_id).order_by(Bid.timestamp.desc()).first()
        last_bidding = last_bid.timestamp if last_bid else None
        auction_bids = Bid.query.filter_by(product_id=product_id).count()
        starting_price_average = compute_starting_price_average(product_id)
        early_bidding = compute_early_bidding(buyer_id, product_id)
        winning_ratio = compute_winning_ratio(buyer_id, product_id)
        auction_duration = compute_auction_duration(product_id)
        bidder_tendency = compute_bidder_tendency(buyer_id)

        # Save the bid with GMT+5 timestamp
        new_bid = Bid(
            product_id=product_id,
            user_id=buyer_id,
            bid_amount=bid_amount,
            bidder_tendency=bidder_tendency,
            bidding_ratio=bidding_ratio,
            successive_outbidding=successive_outbidding,
            last_bidding=last_bidding,
            auction_bids=auction_bids,
            starting_price_average=starting_price_average,
            early_bidding=early_bidding,
            winning_ratio=winning_ratio,
            auction_duration=auction_duration,
            timestamp=gmt_plus_5_timestamp  # Save the timestamp in GMT+5
        )

        db.session.add(new_bid)
        db.session.commit()
        return jsonify({"msg": "Bid placed successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error placing bid", "error": str(e)}), 500


@bidding_bp.route('/get_bids/<int:product_id>', methods=['GET'])
@jwt_required()
def get_bids(product_id):
    try:
        bids = Bid.query.filter_by(product_id=product_id).all()
        bids_data = []
        for bid in bids:
            user = User.query.get(bid.user_id)
            # Convert the timestamp to GMT+5 for display
            bid_timestamp_gmt5 = convert_to_gmt_plus_5(bid.timestamp)
            bids_data.append({
                "bid_id": bid.bid_id,
                "bid_amount": bid.bid_amount,
                "timestamp": bid_timestamp_gmt5.isoformat(),  # Return timestamp in GMT+5
                "username": user.username if user else "Unknown"
            })
        return jsonify(bids_data), 200
    except Exception as e:
        return jsonify({"msg": "Error fetching bids", "error": str(e)}), 500