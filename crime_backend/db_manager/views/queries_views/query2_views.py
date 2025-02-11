from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class Query2View(APIView):
    def get(self, request):

        def parse_time(time_str):
            return datetime.strptime(time_str, '%H:%M').strftime('%H:%M:%S') if time_str else None


        start_time = request.query_params.get('startTime')  
        end_time = request.query_params.get('endTime') 
        crime_code = int(request.query_params.get('crmCd'))
        
        if not start_time or not end_time or not crime_code:
            return Response({"error": "Start time, end time, and crime code are required!"}, status=400)
        
        start_time = parse_time(start_time)  
        end_time = parse_time(end_time) 
        
        try:

            # Aggregation query
            pipeline = [
                {"$match": {
                    "crime_codes.crm_cd": 250,
                    "timestamp.time_occ": {"$gte": start_time, "$lte": end_time}
                }},
                {"$group": {
                    "_id": "$timestamp.date_occ",
                    "total_reports": {"$sum": 1}
                }},
                {"$sort": {"total_reports": -1}}
            ]

            results = list(crime_collection.aggregate(pipeline))
           
            return Response(results, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
