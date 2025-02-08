from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.db import connection
from django.contrib.auth.hashers import make_password, check_password

import secrets
from django.db import connection

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        
        print(f'{username} {email} {password} {confirm_password}')
        if not username or not email or not password or not confirm_password:
            return Response({"error": "All fields are required"}, status=400)
        
        if "@" not in email:
            return Response({"error": "Invalid email format"}, status=400)

        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)

        # Επικύρωση μοναδικότητας
        query_check_username = "SELECT COUNT(*) FROM custom_user WHERE username = %s"
        with connection.cursor() as cursor:
            cursor.execute(query_check_username, [username])
            if cursor.fetchone()[0] > 0:
                return Response({"error": "Username is already taken"}, status=400)

        # Κρυπτογράφηση και εισαγωγή
        hashed_password = make_password(password)
        query_insert_user = """
        INSERT INTO custom_user (username, email, password)
        VALUES (%s, %s, %s)
        RETURNING id
        """
        with connection.cursor() as cursor:
            cursor.execute(query_insert_user, [username, email, hashed_password])
            user_id = cursor.fetchone()[0]

        # Δημιουργία token
        token_key = secrets.token_hex(20)
        query_insert_token = """
        INSERT INTO custom_token (key, user_id, created)
        VALUES (%s, %s, NOW())
        """
        with connection.cursor() as cursor:
            cursor.execute(query_insert_token, [token_key, user_id])

        return Response({"message": "User registered successfully", "token": token_key}, status=201)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Both username and password are required"}, status=400)

        # Έλεγχος αν ο χρήστης υπάρχει
        query_user = "SELECT id, password FROM custom_user WHERE username = %s"
        with connection.cursor() as cursor:
            cursor.execute(query_user, [username])
            result = cursor.fetchone()

        if result:
            user_id, stored_password = result
            # Έλεγχος κωδικού
            if check_password(password, stored_password):
                # Έλεγχος αν υπάρχει token
                query_token = "SELECT key FROM custom_token WHERE user_id = %s"
                with connection.cursor() as cursor:
                    cursor.execute(query_token, [user_id])
                    token_result = cursor.fetchone()

                if token_result:
                    # Επιστροφή υπάρχοντος token
                    token = token_result[0]
                else:
                    # Δημιουργία νέου token
                    token = secrets.token_hex(20)
                    insert_token_query = """
                    INSERT INTO custom_token (key, user_id, created)
                    VALUES (%s, %s, NOW())
                    """
                    with connection.cursor() as cursor:
                        cursor.execute(insert_token_query, [token, user_id])

                return Response({"message": "Login successful", "token": token}, status=200)
            else:
                return Response({"error": "Invalid password"}, status=400)
        else:
            return Response({"error": "Username not found"}, status=400)