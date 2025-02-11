from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class Query5View(APIView):
    def get(self, request):
        try:
            pipeline = [
                {
                    "$unwind": "$crime_codes" 
                },
                {
                    "$match": {
                        "weapon": {"$ne": None}  
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "crime_cd": "$crime_codes.crm_cd",
                            "weapon": "$weapon"
                        },
                        "area_count": {"$addToSet": "$area"} 
                    }
                },
                {
                    "$match": {
                        "area_count.1": {"$exists": True}  
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
                        "weapons": 1  
                    }
                }
            ]

            results = list(crime_collection.aggregate(pipeline))
            print(results)
            return Response(results, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
