from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

class Query10View(APIView):
    def get(self, request):
        officer_name = request.query_params.get('officer_name')

        pipeline = [
            { "$match": { "name": officer_name } }, 
            { "$unwind": "$votes" },
            {
                "$lookup": {
                "from": "crime_reports",
                "localField": "votes",
                "foreignField": "dr_no",
                "as": "crime_info"
                }
            },
            { "$unwind": "$crime_info" },
            { "$group": { "_id": "$crime_info.area" } }
        ]      

        try:
            results_cursor = db.upvotes.aggregate(pipeline)
            results = list(results_cursor) 
            return Response(results, status=200)

        except Exception as e:
            return Response({"Error": str(e)}, status=500)
