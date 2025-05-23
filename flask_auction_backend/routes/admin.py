from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_auction_backend.models.product import Product, db
from flask_auction_backend.models.bid import Bid
from flask_auction_backend.utils.shill_detection import detect_shill_bidding
from flask_auction_backend.models.user import User
import bcrypt

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

# Admin login route
@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Look up the admin user by email
    user = User.query.filter_by(email=email, role='admin').first()

    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        # Password matches, generate access token
        access_token = create_access_token(
            identity=str(user.user_id),
            additional_claims={'role': user.role, 'username': user.username}
        )
        return jsonify(access_token=access_token, role=user.role)
    
    return jsonify({"msg": "Invalid admin credentials!"}), 401

# Admin create user route (for adding an admin)
@admin_bp.route('/create-admin', methods=['POST'])
def create_admin():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if the admin user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "Admin already exists!"}), 400

    # Hash the password before storing
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create the admin user
    admin_user = User(username=username, email=email, password=hashed_password, role='admin')
    
    # Commit to the database
    db.session.add(admin_user)
    db.session.commit()
    
    return jsonify({"msg": "Admin user created successfully!"}), 201



@admin_bp.route('/running_auctions', methods=['GET'])
@jwt_required()
def admin_running_auctions():
    current_user = get_jwt_identity()
    # For admin, current_user should be "admin" (a string)
    # Alternatively, you can get claims if needed using get_jwt()
    # Here we simply check if current_user == "admin"
    if current_user != "admin":
        return jsonify({"msg": "Unauthorized!"}), 403

    products = Product.query.filter_by(auction_status='active').all()
    auctions = [{'product_id': p.product_id, 'name': p.name} for p in products]
    return jsonify(auctions)

@admin_bp.route('/manage_auction/<int:product_id>', methods=['PUT'])
@jwt_required()
def manage_auction(product_id):
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Unauthorized!"}), 403

    action = request.args.get('action')
    
    if action == 'disable':
        Product.query.filter_by(product_id=product_id).update({'auction_status': 'disabled'})
        db.session.commit()
        return jsonify({"msg": "Auction disabled successfully!"})
    
    elif action == 'block':
        Product.query.filter_by(product_id=product_id).update({'auction_status': 'blocked'})
        db.session.commit()
        return jsonify({"msg": "Auction blocked successfully!"})
    
    elif action == 'delete':
        Product.query.filter_by(product_id=product_id).delete()
        Bid.query.filter_by(product_id=product_id).delete()
        db.session.commit()
        return jsonify({"msg": "Auction deleted successfully!"})
    
    return jsonify({"msg": "Invalid action!"}), 400

@admin_bp.route('/detect_shill_bidding', methods=['GET'])
@jwt_required()
def detect_shill():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != 'admin':
        return jsonify({"msg": "Unauthorized!"}), 403

    products = Product.query.filter_by(auction_status='active').all()
    alerts = []

    for product in products:
        bids = Bid.query.filter_by(product_id=product.product_id).all()
        is_shill = detect_shill_bidding(bids)
        
        # Save the shill detection result to the product
        product.shill_detected = is_shill
        db.session.add(product)  # Mark product as changed for DB update
        
        alerts.append({
            'product_id': product.product_id,
            'msg': f"Auction {product.name} shill bidding is {is_shill}"
        })
        print(f"Auction {product.name} shill bidding is {is_shill}")

    db.session.commit()  # Commit all changes to DB once outside the loop

    return jsonify({'alerts': alerts})


@admin_bp.route('/view_buyers', methods=['GET'])
@jwt_required()
def view_buyers():
    # Get the current user's identity from the token
    current_user = get_jwt_identity()

    # Ensure the identity is a dictionary and check if it's an admin
    if isinstance(current_user, dict) and current_user.get('role') != 'admin':
        return jsonify({"msg": "Forbidden! You do not have permission to access this resource."}), 403
    
    # Fetch buyers from the database
    buyers = User.query.filter_by(role='buyer').all()
    
    # Handle the case where no buyers are found
    if not buyers:
        return jsonify({"msg": "No buyers found."}), 404

    # Return buyer data
    return jsonify([{
        'user_id': buyer.user_id,
        'username': buyer.username,
        'email': buyer.email,
        'mobile_no': buyer.mobile_no,
        'address': buyer.address
    } for buyer in buyers])



@admin_bp.route('/view_sellers', methods=['GET'])
@jwt_required()
def view_sellers():
    # Get the current user's identity from the token
    current_user = get_jwt_identity()

    # Ensure the identity is a dictionary and check if it's an admin
    if isinstance(current_user, dict) and current_user.get('role') != 'admin':
        return jsonify({"msg": "Forbidden! You do not have permission to access this resource."}), 403
    
    # Fetch sellers from the database
    sellers = User.query.filter_by(role='seller').all()
    
    # Handle the case where no sellers are found
    if not sellers:
        return jsonify({"msg": "No sellers found."}), 404

    # Return seller data
    return jsonify([{
        'user_id': seller.user_id,
        'username': seller.username,
        'email': seller.email,
        'mobile_no': seller.mobile_no,
        'address': seller.address
    } for seller in sellers])

@admin_bp.route('/view_auctions', methods=['GET'])
@jwt_required()
def view_auctions():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    
    if user is None or user.role != 'admin':
        return jsonify({"msg": "Forbidden! You do not have permission to access this resource."}), 403

    auctions = Product.query.filter(Product.auction_status.in_(['active', 'completed', 'disabled'])).all()

    # Correct image URL prefix
    return jsonify([{
        'product_id': auction.product_id,
        'name': auction.name,
        'description': auction.description,
        'auction_status': auction.auction_status,
        'starting_price': auction.starting_price,
        'auction_end_time': auction.auction_end_time,
        'image_url': f"static/{auction.image_url}" if auction.image_url else None,
         'shill_detected': auction.shill_detected  # Add prefix here
    } for auction in auctions])
