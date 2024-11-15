from flask import Flask, request, jsonify
from venmo_api import Client
from PIL import Image
import pytesseract
import re
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

# Initialize Venmo client
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
client = Client(access_token=ACCESS_TOKEN) if ACCESS_TOKEN else None


# Utility function to get the authenticated user's profile
def get_user_profile(client):
    try:
        profile = client.user.get_my_profile()
        print(f"Successfully retrieved profile for: {profile.username}")
        return profile
    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        return None


# Utility function to get a list of friends' usernames
def get_friends_usernames(client, user_id):
    try:
        friends = client.user.get_user_friends_list(user_id=user_id)
        if friends:
            return [friend.username for friend in friends]
        return []
    except Exception as e:
        print(f"Error getting friends list: {str(e)}")
        return []


# Route: Parse receipt using OCR
@app.route('/parse-receipt', methods=["POST"])
def parse_receipt_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        image = Image.open(file)
        text = pytesseract.image_to_string(image)
        lines = text.split("\n")

        items = []
        for line in lines:
            match = re.match(r"(.+?)\s+(\d+\.\d{2})$", line)
            if match:
                item_name = match.group(1).strip()
                price = float(match.group(2))
                items.append({"item": item_name, "cost": price})
        return jsonify({"items": items})
    except Exception as e:
        return jsonify({"error": f"Failed to parse receipt: {str(e)}"}), 500


# Route: Get the authenticated user's friends list
@app.route('/friends-list', methods=["GET"])
def friends_list():
    if not client:
        return jsonify({"error": "Venmo client not initialized"}), 500

    try:
        profile = get_user_profile(client)
        if not profile:
            return jsonify({"error": "Failed to fetch user profile"}), 500

        friends = get_friends_usernames(client, profile.id)
        return jsonify({"friends": friends})
    except Exception as e:
        return jsonify({"error": f"Failed to fetch friends list: {str(e)}"}), 500


# Route: Assign items to friends (mock version without GUI)
@app.route('/assign-items', methods=["POST"])
def assign_items():
    data = request.json
    if not data or "items" not in data or "friends" not in data:
        return jsonify({"error": "Invalid request data"}), 400

    items = data["items"]
    friends = data["friends"]
    assigned_items = []

    # Mock assignment logic
    for i, item in enumerate(items):
        assigned_items.append({
            "item": item["item"],
            "cost": item["cost"],
            "assigned_to": friends[i % len(friends)]  # Rotate assignments
        })

    return jsonify({"assigned_items": assigned_items})


# Route: Request payments from friends
@app.route('/request-payments', methods=["POST"])
def request_payment():
    data = request.json
    if not data or not all(k in data for k in ("assigned_items",)):
        return jsonify({"error": "Invalid request data"}), 400

    assigned_items = data["assigned_items"]
    results = []

    try:
        for item in assigned_items:
            user = client.user.get_user_by_username(item["assigned_to"])
            if user and user.id:
                client.payment.request_money(
                    amount=item["cost"],
                    note=f"Payment for {item['item']}",
                    target_user_id=user.id
                )
                results.append({
                    "status": "success",
                    "message": f"Requested ${item['cost']} from {item['assigned_to']} for {item['item']}"
                })
            else:
                results.append({
                    "status": "failure",
                    "message": f"User not found: {item['assigned_to']}"
                })
    except Exception as e:
        results.append({
            "status": "error",
            "message": f"Error requesting payments: {str(e)}"
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)
