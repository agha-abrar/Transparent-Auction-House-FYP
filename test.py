# test_smtp.py
import smtplib
from email.message import EmailMessage
from flask_auction_backend.config import Config

# Pull settings from your Config
SMTP_SERVER = Config.MAIL_SERVER
SMTP_PORT   = Config.MAIL_PORT
USERNAME    = Config.MAIL_USERNAME
PASSWORD    = Config.MAIL_PASSWORD

print(f"→ Testing SMTP to {SMTP_SERVER}:{SMTP_PORT} as {USERNAME}")

# 1) Just connect & login
try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
    server.starttls()
    server.login(USERNAME, PASSWORD)
    print("✅ Connected & authenticated to SMTP server")
    server.quit()
except Exception as e:
    print("❌ SMTP login failed:", e)
    exit(1)

# 2) Send a real test message
try:
    msg = EmailMessage()
    msg["Subject"] = "AuctionX End‑to‑End Email Test"
    msg["From"]    = USERNAME
    msg["To"]      = USERNAME  # send to yourself for testing
    msg.set_content(
        "Hello!\n\n"
        "This is a full end‑to‑end SMTP test from your AuctionX project.\n\n"
        "— AuctionX"
    )

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(USERNAME, PASSWORD)
        smtp.send_message(msg)
    print("✅ Test email sent successfully — check your inbox!")
except Exception as e:
    print("❌ Failed to send test email:", e)
    exit(1)
