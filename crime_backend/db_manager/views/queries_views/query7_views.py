from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
upvotes_collection = db["upvotes"]

class Query7View(APIView):
    def get(self, request):

        pipeline = [
            {
                "$project": {
                    "name": 1,
                    "badge_number": 1,
                    "total_upvotes": { "$size": "$votes" } 
                }
            },
            {
                "$sort": {
                    "total_upvotes": -1 
                }
            },
            {
                "$limit": 50                         
            }
        ]

        try:
            results = list(upvotes_collection.aggregate(pipeline))
            print(results)

            return Response(results, status=200)
            
        except Exception as e:
            return Response({"Error": str(e)}, status=500)
