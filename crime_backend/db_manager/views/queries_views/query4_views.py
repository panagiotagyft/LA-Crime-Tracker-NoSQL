from rest_framework.views import APIView
from rest_framework.response import Response
from pymongo import MongoClient
from datetime import datetime

# Connecting to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

class Query4View(APIView):
    def get(self, request):
        
        start_time = request.query_params.get('startTime')  
        end_time = request.query_params.get('endTime')  

        if not start_time or not end_time:
            return Response({"error": "Start time and end time are required."}, status=400)

        def parse_time(time_str):
            return datetime.strptime(time_str, '%H:%M').strftime('%H:%M:%S') if time_str else None

        start_time = parse_time(start_time)  
        end_time = parse_time(end_time) 

        try:
        
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
                        "_id": "$crime_codes.crm_cd",  
                        "report_count": {"$sum": 1} 
                    }
                },
                { 
                    "$sort": { "count": 1 } 
                },
                { 
                    "$limit": 2 
                }
            ]

            results = list(db.crime_reports.aggregate(pipeline))
            print(results)
            return Response(results, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
