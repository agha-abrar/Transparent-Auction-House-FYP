from datetime import datetime
import os
import traceback
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from flask_auction_backend.models.product import Product, db
from flask_auction_backend.models.bid import Bid
import pytz
from flask_auction_backend.app import mail  # Import the mail instance
from flask_auction_backend.models.user import User  # Import the User model
from flask_mail import Message
from flask import Blueprint, jsonify, current_app  

auction_bp = Blueprint('auction_bp', __name__, url_prefix='/api')


# In your auction.py route file

@auction_bp.route('/user_auctions', methods=['GET'])
@jwt_required()
def get_user_auctions():
    try:
        user_id = get_jwt_identity()
        user_bids = Bid.query.filter_by(user_id=user_id).all()
        auctions = []
        for bid in user_bids:
            auction = Product.query.get(bid.product_id)
            if auction:
                auctions.append({
                    'product_id': auction.product_id,
                    'name': auction.name,
                    'description': auction.description,
                    'starting_price': auction.starting_price,
                    'auction_status': auction.auction_status,
                    'auction_end_time': auction.auction_end_time.isoformat() if auction.auction_end_time else None,
                    'image_url': auction.image_url      # ← add this
                })
        return jsonify(auctions), 200
    except Exception as e:
        return jsonify({"msg": "Error fetching user auctions", "error": str(e)}), 500


@auction_bp.route('/auction/<int:product_id>', methods=['GET'])
def get_auction_details(product_id):
    # Fetch auction details by product_id
    auction = Product.query.get(product_id)
    if not auction:
        return jsonify({"msg": "Auction not found"}), 404

    # Fetch associated bids for the auction
    bids = Bid.query.filter_by(product_id=product_id).all()

    # Format bids as needed
    bid_data = [{
        "username": bid.user.username,  # Assuming Bid has a relationship to User
        "amount": bid.bid_amount,
        "timestamp": bid.timestamp
    } for bid in bids]

    # Check if the auction has a winner
    winner_name = auction.winner.username if auction.winner else None

    # Return auction details and bid data in a JSON response
    return jsonify({
        "auction": auction.to_dict(),  # Assuming Product has a method to_dict() for serialization
        "bids": bid_data,
        "winner_name": winner_name  # Add winner's name here
    }), 200



@auction_bp.route('/user_auctions_won', methods=['GET'])
@jwt_required()
def get_user_auctions_won():
    try:
        user_id = get_jwt_identity()
        auctions_won = Product.query.filter_by(winner_id=user_id).all()
        auctions = []
        for auction in auctions_won:
            auctions.append({
                'product_id': auction.product_id,
                'name': auction.name,
                'description': auction.description,
                'starting_price': auction.starting_price,
                'auction_status': auction.auction_status,
                'auction_end_time': auction.auction_end_time.isoformat() if auction.auction_end_time else None,
                'image_url': auction.image_url      # ← and this
            })
        return jsonify(auctions), 200
    except Exception as e:
        return jsonify({"msg": "Error fetching won auctions", "error": str(e)}), 500


@auction_bp.route('/create_auction', methods=['POST'])
@jwt_required()
def create_auction():
    try:
        # Get seller's ID from token
        seller_id = int(get_jwt_identity())

        # Get form data
        name = request.form.get('name')
        description = request.form.get('description')
        starting_price = float(request.form.get('starting_price'))
        auction_end_time_str = request.form.get('auction_end_time')  # Expected format: "YYYY-MM-DDTHH:MM"
        
        # Convert the auction_end_time string into a datetime object (local time)
        auction_end_time = datetime.strptime(auction_end_time_str, "%Y-%m-%dT%H:%M")
        
        # Convert to GMT+5 using pytz
        gmt_plus_5_time_zone = pytz.timezone('Asia/Karachi')  # GMT+5 time zone
        auction_end_time = gmt_plus_5_time_zone.localize(auction_end_time)  # Localize the datetime to GMT+5

        # Get the absolute path to the 'flask_auction_backend/static/uploads' directory
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))  # Get the absolute path of flask_auction_backend
        upload_folder = os.path.join(base_dir, 'static', 'uploads')  # Path to 'flask_auction_backend/static/uploads'

        # Create the 'uploads' folder if it doesn't exist
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # Handle the image upload if present
        image_url = None
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image_path = os.path.join(upload_folder, filename)
            image.save(image_path)
            # Store only the relative path from 'static/'
            image_url = os.path.join('uploads', filename)

        # Create a new auction product
        new_product = Product(
            name=name,
            description=description,
            seller_id=seller_id,
            starting_price=starting_price,
            auction_end_time=auction_end_time,  # Save auction_end_time as GMT+5
            image_url=image_url,
            auction_status='active'
        )
        db.session.add(new_product)
        db.session.commit()

        # Send email to all buyers
        buyers = User.query.filter_by(role='buyer').all()
        for buyer in buyers:
            # Send email notification
            msg = Message(
                subject="New Auction Created - Place Your Bid Now!",
                recipients=[buyer.email],
                body=f"Dear {buyer.username},\n\nA new auction has been created. Check out the details below:\n\nAuction: {name}\nDescription: {description}\nStarting Price: ${starting_price}\nAuction End Time: {auction_end_time.strftime('%Y-%m-%d %H:%M:%S')}\n\nVisit the auction page to place your bid.\n\nBest regards,\nAuctionX"
            )
            try:
                mail.send(msg)
                print(f"Email sent to {buyer.email}")
            except Exception as e:
                print(f"Error sending email to {buyer.email}: {e}")
        
        return jsonify({"msg": "Auction created successfully and emails sent to buyers!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error creating auction", "error": str(e)}), 500
    
    

@auction_bp.route('/running_auctions', methods=['GET'])
@jwt_required()
def running_auctions():
    
    try:
        # Get auctions that are active or completed
        products = Product.query.filter(Product.auction_status.in_(["active", "completed","disabled"])).all()

        if not products:
            return jsonify({"msg": "No auctions found"}), 404  # Add check for empty list of auctions

        auctions = []
        for product in products:
            # Fetch the last two bids for the product, ordered by timestamp
            bids = Bid.query.filter_by(product_id=product.product_id).order_by(Bid.timestamp.desc()).limit(2).all()

            auctions.append({
                'product_id': product.product_id,
                'name': product.name,
                'description': product.description,
                'image_url': product.image_url,
                'starting_price': product.starting_price,
                'auction_status': product.auction_status,
                'auction_end_time': product.auction_end_time.isoformat() if product.auction_end_time else None,
                'winner_name': product.winner.username if product.winner else None,
                'bids': [{
                    'bid_id': bid.bid_id,
                    'username': bid.user.username if bid.user else "Unknown",  # Access user correctly
                    'bid_amount': bid.bid_amount,
                    'timestamp': bid.timestamp.isoformat()
                } for bid in bids]  # Including the last 2 bids only
            })

        return jsonify(auctions), 200
    except Exception as e:
        print(f"Error fetching auctions: {e}")
        return jsonify({"msg": "Error retrieving auctions", "error": str(e)}), 500




@auction_bp.route('/seller_auctions', methods=['GET'])
@jwt_required()
def seller_auctions():
    try:
        seller_id = int(get_jwt_identity())
        # For the Seller Dashboard, return auctions for this seller with status "active"
        products = Product.query.filter_by(seller_id=seller_id, auction_status='active').all()
        
        auctions = []
        for p in products:
            bids = Bid.query.filter_by(product_id=p.product_id).all()  # Get all bids for the auction
            auction_data = {
                'product_id': p.product_id,
                'name': p.name,
                'description': p.description,
                'image_url': p.image_url,
                'starting_price': p.starting_price,
                'auction_status': p.auction_status,
                'auction_end_time': p.auction_end_time.isoformat() if p.auction_end_time else None,
                'winner_name': p.winner.username if p.winner else None,
                'bids': [{'username': bid.user.username, 'bid_amount': bid.bid_amount, 'timestamp': bid.timestamp} for bid in bids]
            }
            auctions.append(auction_data)
        
        return jsonify(auctions), 200
    except Exception as e:
        return jsonify({"msg": "Error retrieving seller auctions", "error": str(e)}), 500

    


@auction_bp.route('/seller_completed_auctions', methods=['GET'])
@jwt_required()
def seller_completed_auctions():
    try:
        seller_id = int(get_jwt_identity())

        # Fetch completed and disabled auctions for this seller
        products = Product.query.filter(
            Product.seller_id == seller_id,
            Product.auction_status.in_(['completed', 'disabled'])
        ).all()

        completed_auctions = [{
            'product_id': p.product_id,
            'name': p.name,
            'description': p.description,
            'image_url': p.image_url,
            'starting_price': p.starting_price,
            'auction_status': p.auction_status,
            'auction_end_time': p.auction_end_time.isoformat() if p.auction_end_time else None,
            'winner_name': p.winner.username if p.winner else None
        } for p in products]

        return jsonify(completed_auctions), 200
    except Exception as e:
        return jsonify({"msg": "Error retrieving seller completed auctions", "error": str(e)}), 500


@auction_bp.route('/send_test_email', methods=['GET'])
def send_test_email():
    """
    One‑off endpoint to verify your Flask‑Mail config.
    Sends a test email to MAIL_USERNAME.
    """
    try:
        to_addr = current_app.config['MAIL_USERNAME']
        msg = Message(
            subject="🏁 AuctionX SMTP Test",
            recipients=[to_addr]
        )
        msg.body = (
            "Hello!\n\n"
            "This is a test email from your AuctionX Flask app.\n"
            "If you see this in your inbox (or spam), your SMTP is working correctly!\n\n"
            "— AuctionX"
        )
        mail.send(msg)
        return jsonify({"msg": f"Test email sent to {to_addr}"}), 200

    except Exception as e:
        current_app.logger.error(f"send_test_email error: {e}")
        return jsonify({"msg": "Failed to send test email", "error": str(e)}), 500


@auction_bp.route('/check_auctions', methods=['GET'])
@jwt_required()
def check_auctions():
    """
    1) Find all active auctions whose end_time ≤ now (Asia/Karachi GMT+5).
    2) Mark them completed, assign winner_id.
    3) Send emails to both winner and seller.
    4) Return JSON report.
    """
    results = []
    tz  = pytz.timezone('Asia/Karachi')
    now = datetime.now(tz)
    current_app.logger.info(f"[check_auctions] running at {now.isoformat()}")

    try:
        expired = Product.query.filter(
            Product.auction_status == 'active',
            Product.auction_end_time <= now
        ).all()
        current_app.logger.info(f"[check_auctions] found {len(expired)} expired auctions")

        for auction in expired:
            current_app.logger.info(f"[check_auctions] processing auction #{auction.product_id} (“{auction.name}”)")
            rec = {
                "product_id": auction.product_id,
                "name": auction.name,
                "emails": {"winner": None, "seller": None}
            }

            # 1) Mark completed
            auction.auction_status = 'completed'

            # 2) Pick highest bid
            highest = (Bid.query
                          .filter_by(product_id=auction.product_id)
                          .order_by(Bid.bid_amount.desc(), Bid.timestamp.asc())
                          .first())

            if not highest:
                current_app.logger.info(" → no bids, skipping emails")
                rec["emails"] = {"winner": "no bids", "seller": "no bids"}
            else:
                auction.winner_id = highest.user_id
                seller = User.query.get(auction.seller_id)
                winner = User.query.get(highest.user_id)

                # Winner email
                try:
                    current_app.logger.info(f" → emailing winner {winner.email}")
                    msg = Message(
                        subject=f"🎉 You won: {auction.name}",
                        recipients=[winner.email]
                    )
                    msg.body = (
                        f"Hi {winner.username},\n\n"
                        f"Congratulations! You won “{auction.name}” with a bid of ${highest.bid_amount:.2f}.\n\n"
                        f"Please contact the seller at {seller.email} to finalize.\n\n"
                        "— AuctionX"
                    )
                    mail.send(msg)
                    rec["emails"]["winner"] = "sent"
                except Exception as e:
                    current_app.logger.error(f"Winner email error: {e}")
                    rec["emails"]["winner"] = f"error: {e}"

                # Seller email
                try:
                    current_app.logger.info(f" → emailing seller {seller.email}")
                    msg = Message(
                        subject=f"🏆 Auction ended: {auction.name}",
                        recipients=[seller.email]
                    )
                    msg.body = (
                        f"Hi {seller.username},\n\n"
                        f"Your auction “{auction.name}” has completed. "
                        f"The winner is {winner.username} ({winner.email}) "
                        f"at ${highest.bid_amount:.2f}.\n\n"
                        "Please get in touch to close the sale.\n\n"
                        "— AuctionX"
                    )
                    mail.send(msg)
                    rec["emails"]["seller"] = "sent"
                except Exception as e:
                    current_app.logger.error(f"Seller email error: {e}")
                    rec["emails"]["seller"] = f"error: {e}"

            # Stage DB update
            db.session.add(auction)
            results.append(rec)

        # Commit all changes & return report
        db.session.commit()
        return jsonify({
            "msg":     f"Processed {len(expired)} auctions.",
            "results": results
        }), 200

    except Exception as e:
        traceback.print_exc()
        db.session.rollback()
        return jsonify({
            "msg":             "Error checking auctions",
            "error":           str(e),
            "partial_results": results
        }), 500


@auction_bp.route('/search_products', methods=['GET'])
def search_products():
    try:
        search_query = request.args.get('query', '')

        if not search_query:
            return jsonify({"msg": "Search query is required."}), 400

        products = Product.query.filter(
            Product.name.ilike(f"%{search_query}%")  # Partial, case-insensitive match
        ).all()

        product_list = [{
            'product_id': p.product_id,
            'name': p.name,
            'description': p.description,
            'starting_price': p.starting_price,
            'auction_status': p.auction_status,
            'image_url': p.image_url
        } for p in products]

        return jsonify(product_list), 200
    except Exception as e:
        return jsonify({"msg": "Error occurred", "error": str(e)}), 500
