from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

# Σύνδεση με MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class Query6View(APIView):
    def get(self, request):
        try:
            
            date = request.query_params.get('date')
            if not date:
                return Response({"error": "Date parameter is required"}, status=400)

            pipeline = [
                {
                    "$match": { "date_rptd": date }  
                },
                {
                    "$project": {  
                        "_id": 0,  
                        "dr_no": 1,
                        "upvote_count": 1
                    }
                },
                {
                    "$sort": { "upvote_count": -1 }  
                },
                {
                    "$limit": 50  
                }
            ]

            results = list(crime_collection.aggregate(pipeline))
            print(results)
            return Response(results, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
