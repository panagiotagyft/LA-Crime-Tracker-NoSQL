from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

class Query9View(APIView):
    def get(self, request):

        pipeline = [
            { "$unwind": "$votes" },
            {
                "$group": {
                    "_id": "$email",
                    "uniqueBadgeNumbers": { "$addToSet": "$badge_number" },
                    "allDrNos": { "$push": "$votes" }
                }
            },
            {
                "$match": { "uniqueBadgeNumbers.1": { "$exists": True } } # If there are at least 2 badge_numbers
            },
            {
                "$project": {
                    "_id": 0,
                    "email": "$_id",
                    "uniqueBadgeNumbers": 1,
                    "allDrNos": 1
                }
            }
        ]

        try:
            results = list(db.upvotes.aggregate(pipeline))
            for doc in results:
                print(doc)
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        
