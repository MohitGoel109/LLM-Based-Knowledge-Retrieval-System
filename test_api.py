#!/usr/bin/env python3
"""Test script to verify the API is working locally"""

import requests
import json

def test_api():
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Health endpoint: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Health endpoint failed: {e}")
    
    # Test chat endpoint
    try:
        payload = {
            "question": "What are the admission requirements?",
            "history": []
        }
        response = requests.post("http://localhost:8000/chat", 
                               json=payload, 
                               timeout=10)
        print(f"Chat endpoint: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Chat endpoint failed: {e}")

if __name__ == "__main__":
    test_api()