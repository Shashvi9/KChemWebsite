"""
Simple keep-alive script to prevent Render free tier from sleeping
Run this on a cron job every 10-14 minutes to keep the backend warm
"""
import requests
import time

BACKEND_URL = "https://kewinchem-backend.onrender.com"

def ping_backend():
    """Ping the backend to keep it alive"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=30)
        if response.status_code == 200:
            print(f"✅ Backend is alive - Status: {response.status_code}")
        else:
            print(f"⚠️  Backend responded with status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error pinging backend: {e}")

if __name__ == "__main__":
    ping_backend()
