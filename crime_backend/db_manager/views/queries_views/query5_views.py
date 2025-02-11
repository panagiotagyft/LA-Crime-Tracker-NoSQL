from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

# Σύνδεση με MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class Query5View(APIView):
    def get(self, request):
        try:
            pipeline = [
                {
                    "$addFields": {  
                        "first_crime_code": { "$arrayElemAt": ["$crime_codes", 0] }
                    }
                },
                {
                    "$match": {
                        "weapon": {"$ne": None}  
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "crime_cd": "$first_crime_code.crm_cd",  
                            "weapon": "$weapon"
                        },
                        "areas": {"$addToSet": "$area"}  
                    }
                },
                {
                    "$match": {
                        "areas.1": {"$exists": True}  
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.crime_cd",
                        "weapons": {"$addToSet": "$_id.weapon"}  
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "crime_cd": "$_id",
                        "weapons": {"$setUnion": ["$weapons", []]}  
                    }
                },
                {
                    "$sort": {"crime_cd": 1}  
                }
            ]

            results = list(crime_collection.aggregate(pipeline))
            return Response(results, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
