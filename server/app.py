from flask import Flask, request, jsonify
from flask_cors import CORS
from venmo_api import Client
from PIL import Image
import pytesseract
import re
import os
from dotenv import load_dotenv
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)
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
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
import cv2
import numpy as np
import re
import os

app = Flask(__name__)
CORS(app)

exclude_keywords = [
    "subtotal", "total", "change", "balance",
    "amount due", "grand total", "payment", "visa", "mastercard",
    "credit", "debit", "cash", "thank you", "regular price",
    "discount", "savings", "you saved"
]

@app.route('/parse-receipt', methods=["POST"])
def parse_receipt_endpoint():
    print("parse-receipt endpoint hit")

    # Check for file in request
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        print("parsing image...")

        # Save the uploaded file temporarily for OpenCV processing
        temp_filename = "uploaded_image.jpg"
        file.save(temp_filename)

        # Load image using OpenCV
        image = cv2.imread(temp_filename)

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply thresholding to binarize the image
        _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

        # Optionally apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(binary, (5, 5), 0)

        # Optionally apply morphological operations to clean up the image
        kernel = np.ones((1, 1), np.uint8)
        morphed = cv2.morphologyEx(blurred, cv2.MORPH_CLOSE, kernel)

        # Save preprocessed image for debugging
        preprocessed_filename = "preprocessed_image.jpg"
        cv2.imwrite(preprocessed_filename, morphed)
        print(f"Preprocessed image saved as {preprocessed_filename}")

        # OCR using Tesseract
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(morphed, config=custom_config)

        # Split text into lines
        lines = text.split("\n")
        print(f"# of lines: {len(lines)}")

        lines = [clean_line(line) for line in lines]

        
        # Process lines to extract items and prices
        items = []
        for line in lines:
            print(f"Processing line: {line}")

            if should_exclude_line(line):
                print(f"excluded by keyword: {line}")
                continue
            
            # match = re.match(r"(.+?)\s*[\$]?\s*(\d+\.\d{2})", line)
            price_matches = re.findall(r"\d+\.\d{2}", line)
            if price_matches:
                # Assumes the last price in the line is the actual price
                price = float(price_matches[-1])
                item_name = re.sub(r"\d+\.\d{2}", "", line).strip()
                items.append({"item": item_name, "cost": price})
                print(f"Item found: {item_name}, Price: {price}")

        # Clean up temporary files
        os.remove(temp_filename)
        os.remove(preprocessed_filename)

        # Return parsed items
        if items:
            return jsonify({"items": items})
        else:
            return jsonify({"error": "No valid items found"}), 400

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to parse receipt: {str(e)}"}), 500

# HELPER FUNCTIONS

# Keeps only alphanumeric and importantn special characters
def clean_line(line):
    return re.sub(r"[^\w\s\.\$,]", "", line)

# Lines to be excluded because of keywords
def should_exclude_line(line):
    line_lower = line.lower()
    return any(keyword in line_lower for keyword in exclude_keywords)


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

# Test Route
@app.route('/test', methods=['GET'])
def test():
    return "Server is accessible!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
