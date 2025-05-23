# test_create.py
from flask_auction_backend.app import app, db
from sqlalchemy import inspect

with app.app_context():
    db.create_all()
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()
    print("Tables in DB:", table_names)
