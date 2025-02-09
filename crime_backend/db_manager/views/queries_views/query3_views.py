from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["crime_tracker"]
crime_collection = db["crime_reports"]

class Query3View(APIView):
    def get(self, request):
        # Parse and validate the date
        def parse_date(date_str):
            return datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d') if date_str else None

        date = parse_date(request.query_params.get('date'))
        print(date)
        if not date:
            return Response({"Error": "Date is required!!"}, status=400)

        pipeline = [
            { "$match": { "date_rptd": date } },
            {
                "$unwind": "$crime_codes"  # Ξεδιπλώνουμε το array των crime_codes
            },
            {
                "$group": {
                    "_id": {
                        "area_name": "$area.area_name",
                        "crime_cd": "$crime_codes.crm_cd"
                    },
                    "count": {"$sum": 1}  # Υπολογίζουμε τον αριθμό των εγκλημάτων
                }
            },
            {
                "$group": {
                    "_id": "$_id.area_name",  # Ομαδοποιούμε ανά περιοχή
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
                    "area_name": "$_id",
                    "top_crimes": {
                        "$slice": [
                            {"$sortArray": {"input": "$crimes", "sortBy": {"count": -1}}}, 3
                        ]
                    }
                }
            }

        ]

        try:
            results = list(crime_collection.aggregate(pipeline))
            print(results)
            return Response(results, status=200)
        
        except Exception as e:
            return Response({"Error": str(e)}, status=500)
