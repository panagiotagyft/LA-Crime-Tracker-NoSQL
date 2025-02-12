from pymongo import MongoClient
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class Query3View(APIView):
    def get(self, request):
        
        date = request.query_params.get('date')
        if not date:
            return Response({"Error": "Date is required!"}, status=400)

        try:
            pipeline = [
                { "$match": { "date_rptd": date } },  
                { "$unwind": "$crime_codes" },  
                {
                    "$group": {
                        "_id": {
                            "area": "$area.area_name",
                            "crime_cd": "$crime_codes.crm_cd"
                        },
                        "count": { "$sum": 1 } 
                    }
                },
                {
                    "$group": {
                        "_id": "$_id.area",  
                        "crimes": {
                            "$push": {
                                "crime_cd": "$_id.crime_cd",
                                "count": "$count"
                            }
                        }
                    }
                },
                {
                    "$project": {
                        "area": "$_id",
                        "top_crimes": {
                            "$slice": [
                                {"$sortArray": {"input": "$crimes", "sortBy": {"count": -1}}}, 3
                            ]  
                        }
                    }
                }
            ]

            results = list(crime_collection.aggregate(pipeline))
            return Response(results, status=200)

        except Exception as e:
            return Response({"Error": str(e)}, status=500)
