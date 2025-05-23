from flask_auction_backend.app import app, db
from sqlalchemy import text

with app.app_context():
    print("Database URI:", app.config.get("SQLALCHEMY_DATABASE_URI"))
    print("Engine URL:", str(db.engine.url))
    
    # Obtain a connection from the engine and execute a query using text()
    with db.engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        for row in result:
            print("PostgreSQL version:", row[0])
