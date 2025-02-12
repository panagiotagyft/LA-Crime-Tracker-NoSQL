from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

class Query8View(APIView):
    def get(self, request):

        pipeline = [
            { "$unwind": "$votes" },  
            {
                "$lookup": {
                    "from": "crime_reports",
                    "localField": "votes",
                    "foreignField": "dr_no",
                    "pipeline": [
                        { "$project": { "area": 1, "_id": 0 } }  
                    ],
                    "as": "joined"
                }
            },
            { "$unwind": "$joined" }, 
            {
                "$group": {
                    "_id": {
                        "officerName": "$name",
                        "badgeNumber": "$badge_number"
                    },
                    "distinctAreas": { "$addToSet": "$joined.area" }  
                }
            },
            {
                "$project": {
                    "_id": 0, 
                    "officerName": "$_id.officerName",
                    "badgeNumber": "$_id.badgeNumber",
                    "totalDistinctAreas": { "$size": "$distinctAreas" }  
                }
            },
            { "$sort": { "totalDistinctAreas": -1 } }, 
            { "$limit": 50 }  
        ]

        try:
            results_cursor = db.upvotes.aggregate(pipeline)
            results = list(results_cursor)
            return Response(results, status=200) 
        
        except Exception as e:
            return Response({"Error": str(e)}, status=500)
