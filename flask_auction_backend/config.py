from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()  # This will load the variables from your .env file

class Config:
    # Secret Key for sessions and CSRF protection
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key-here')  # Fallback to default if not found in .env
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key-here')  # Fallback for JWT secret

    # Database configuration (PostgreSQL URI)
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'postgresql://auction_user:new_password@localhost/auction_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail configuration for sending password reset emails
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = "shankhan9226@gmail.com"
    MAIL_PASSWORD = "bxoj hlsw obgu jibs"
    MAIL_DEFAULT_SENDER = "AuctionX"  # Default sender's name for email
