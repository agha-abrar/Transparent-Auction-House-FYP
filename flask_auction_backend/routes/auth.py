from flask import Blueprint, Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_auction_backend.models.user import User, db
from werkzeug.utils import secure_filename
import bcrypt
import os
from flask_mail import Mail, Message  # Added for sending emails
from itsdangerous import URLSafeTimedSerializer as Serializer, BadSignature, SignatureExpired  # Added for token-based reset
from flask_auction_backend.config import Config  # Assuming the config is defined in config.py
from flask_auction_backend.app import mail  # Ensure that you have `mail` initialized in `app.py`
from flask import render_template
from flask_auction_backend.app import app

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api')


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        # Use identity as a string, and pass extra info in additional_claims
        access_token = create_access_token(
            identity=str(user.user_id),
            additional_claims={'role': user.role, 'username': user.username}
        )
        return jsonify(access_token=access_token, role=user.role)
    return jsonify({"msg": "Invalid credentials!"}), 401


# Example of a profile API route
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        # Retrieve the user data from the database
        user_id = get_jwt_identity()  # Get the current user ID from the token
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Return the profile data as JSON
        return jsonify({
            "username": user.username,
            "email": user.email,
            "mobile_no": user.mobile_no,
            "address": user.address,
            "profile_picture": user.profile_picture
        })
    except Exception as e:
        return jsonify({"msg": "Error retrieving profile", "error": str(e)}), 500



@auth_bp.route('/register', methods=['POST'])
def register():
    # Check if the request is multipart/form-data (for file upload)
    if request.content_type.startswith('multipart/form-data'):
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role', 'buyer')
        mobile_no = request.form.get('mobile_no')
        address = request.form.get('address')
        cnic_number = request.form.get('cnic_number')
        profile_picture_file = request.files.get('profile_picture')

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Save the profile picture if provided
        profile_picture_path = None
        if profile_picture_file:
            # Get the absolute path to the 'flask_auction_backend/static/profile_pics' directory
            base_dir = os.path.dirname(os.path.abspath(__file__))  # Get absolute path of the current directory
            upload_folder = os.path.join(base_dir, '..', 'static', 'profile_pics')  # Save profile pics in flask_auction_backend/static/profile_pics

            # Create the 'profile_pics' folder if it doesn't exist
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            filename = secure_filename(profile_picture_file.filename)
            profile_picture_path = os.path.join('profile_pics', filename)  # Relative path from static/
            profile_picture_file.save(os.path.join(upload_folder, filename))  # Save profile picture in the correct directory
    else:
        # Otherwise, assume a JSON payload without file upload
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'buyer')
        mobile_no = data.get('mobile_no')
        address = data.get('address')
        cnic_number = data.get('cnic_number')
        profile_picture_path = None

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create a new user
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        role=role,
        mobile_no=mobile_no,
        address=address,
        cnic_number=cnic_number,
        profile_picture=profile_picture_path
    )
    
    # Add the new user to the database and commit
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully!"}), 201

@auth_bp.route('/admin/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')

    # Print for debugging purposes
    print(f"Received email: {email}")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Create a URLSafeTimedSerializer instance
    try:
        s = Serializer(os.getenv('SECRET_KEY'))  # Make sure to load the correct SECRET_KEY
        token = s.dumps(email, salt='password-reset-salt')
    except Exception as e:
        print(f"Error generating token: {e}")
        return jsonify({"msg": "Error generating token", "error": str(e)}), 500

    reset_link = f"http://localhost:3000/admin/reset-password/{token}"


    # Send email
    try:
        msg = Message('Password Reset Request', recipients=[email])
        msg.body = f'Click the following link to reset your password: {reset_link}'
        mail.send(msg)
        return jsonify({"msg": "Password reset link sent to your email!"}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"msg": "Error sending email", "error": str(e)}), 500

# in routes/auth.py

@auth_bp.route('/admin/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        s = Serializer(os.getenv('SECRET_KEY'))
        email = s.loads(token, salt='password-reset-salt')
    except SignatureExpired:
        return jsonify({"msg": "The reset link has expired."}), 400
    except BadSignature:
        return jsonify({"msg": "The reset link is invalid."}), 400

    data = request.get_json()
    new_password = data.get('new_password')

    if not new_password:
        return jsonify({"msg": "New password is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found."}), 404

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password = hashed_password
    db.session.commit()

    return jsonify({"msg": "Your password has been reset successfully!"}), 200
