from flask_auction_backend.app import app, db
from flask_auction_backend.models.user import User
import bcrypt

# Function to create admin users
def create_admin_users():
    # List of admin user data (username, email, password)
    admin_users = [
        {"username": "Agha", "email": "abrarkhan9226@gmail.com", "password": "12345678"},
        {"username": "Shan", "email": "shankhan9226@gmail.com", "password": "11223344"}
    ]

    for admin in admin_users:
        # Check if the admin user already exists
        existing_user = User.query.filter_by(email=admin['email']).first()
        if existing_user:
            print(f"Admin user with email {admin['email']} already exists.")
            continue

        # Hash the password
        hashed_password = bcrypt.hashpw(admin['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create a new admin user
        new_admin = User(
            username=admin['username'],
            email=admin['email'],
            password=hashed_password,
            role='admin'
        )

        # Add the new user to the session and commit
        db.session.add(new_admin)
        db.session.commit()
        print(f"Admin user {admin['username']} created successfully!")

# Run the script to create admin users
if __name__ == "__main__":
    with app.app_context():
        create_admin_users()  # Call the function to create the admin users
