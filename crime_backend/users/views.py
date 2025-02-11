from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from pymongo import MongoClient
import secrets
from datetime import datetime

# Σύνδεση με MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
users_collection = db["users"]
tokens_collection = db["tokens"]

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not username or not email or not password or not confirm_password:
            return Response({"error": "All fields are required"}, status=400)

        if "@" not in email:
            return Response({"error": "Invalid email format"}, status=400)

        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)

        # Έλεγχος αν υπάρχει ο χρήστης
        if users_collection.find_one({"username": username}):
            return Response({"error": "Username is already taken"}, status=400)

        # Κρυπτογράφηση κωδικού και εισαγωγή χρήστη
        hashed_password = make_password(password)
        new_user = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(new_user)

        # Δημιουργία token
        token_key = secrets.token_hex(20)
        tokens_collection.insert_one({
            "key": token_key,
            "username": username,
            "created_at": datetime.utcnow()
        })

        return Response({"message": "User registered successfully", "token": token_key}, status=201)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Both username and password are required"}, status=400)

        # Βρείτε τον χρήστη
        user = users_collection.find_one({"username": username})
        if not user:
            return Response({"error": "Username not found"}, status=400)

        # Επαλήθευση κωδικού
        if check_password(password, user["password"]):
            # Έλεγχος ή δημιουργία token
            token = tokens_collection.find_one({"username": username})
            if not token:
                token_key = secrets.token_hex(20)
                tokens_collection.insert_one({
                    "key": token_key,
                    "username": username,
                    "created_at": datetime.utcnow()
                })
                return Response({"message": "Login successful", "token": token_key}, status=200)
            else:
                return Response({"message": "Login successful", "token": token["key"]}, status=200)
        else:
            return Response({"error": "Invalid password"}, status=400)
