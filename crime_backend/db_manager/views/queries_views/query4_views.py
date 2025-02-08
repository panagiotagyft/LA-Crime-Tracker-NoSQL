from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query4View(APIView):
    def get(self, request):
        
        def parse_date(date_str):
            return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        start_date = parse_date(request.query_params.get('startDate'))
        end_date = parse_date(request.query_params.get('endDate'))
        
        if not start_date or not end_date:
            return Response({"Error": "Start/End date are required!"}, status=400)

        try:
            with connection.cursor() as cursor:
                sql = """
                    SELECT COUNT(report.dr_no) / (COUNT(DISTINCT time.date_occ) * 24) AS avg_number_of_crimes_per_hour
                    FROM Crime_report AS report 
                    JOIN Timestamp AS time ON report.timestamp_id = time.timestamp_id
                    WHERE time.date_occ BETWEEN %s AND %s;
                """
                cursor.execute(sql, [start_date, end_date])
                rows = cursor.fetchall()
            
            if not rows or rows[0][0] is None:  # Handle empty or NULL result
                return Response({"message": "No data available for the given time range."}, status=200)

            avg_crimes_per_hour = rows[0][0]  # Extract the scalar result
            return Response({"avg_number_of_crimes_per_hour": avg_crimes_per_hour}, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
