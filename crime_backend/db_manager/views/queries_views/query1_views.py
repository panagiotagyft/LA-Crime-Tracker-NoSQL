from rest_framework.views import APIView
from rest_framework.response import Response
from pymongo import MongoClient
from datetime import datetime

# Σύνδεση στη MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["crime_tracker"]
crime_collection = db["crime_reports"]

class Query1View(APIView):
    def get(self, request):
        start_time = request.query_params.get('startTime')  # π.χ., "14:00"
        end_time = request.query_params.get('endTime')  # π.χ., "18:00"

        if not start_time or not end_time:
            return Response({"error": "Start time and end time are required."}, status=400)

        try:
            # Μετατροπή της ώρας σε ακέραιες τιμές για τη σύγκριση
            #start_time = int(start_time.replace(":", ""))
            ##end_time = int(end_time.replace(":", ""))
            print(start_time, end_time)
            # MongoDB Aggregation Pipeline
            pipeline = [
                {
                    "$unwind": "$crime_codes" 
                },
                {
                    "$match": {
                        "timestamp.time_occ": {"$gte": start_time, "$lte": end_time}
                    }
                },
                {
                    "$group": {
                        "_id": "$crime_codes.crm_cd",  # Ομαδοποίηση κατά Crime Code
                        "report_count": {"$sum": 1}  # Μέτρηση αναφορών
                    }
                },
                {
                    "$sort": {"report_count": -1}  # Ταξινόμηση σε φθίνουσα σειρά
                }
            ]

            results = list(crime_collection.aggregate(pipeline))
            print(results)
            return Response(results, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
