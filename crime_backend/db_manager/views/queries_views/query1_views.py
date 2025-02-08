from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response

class Query1View(APIView):
    def get(self, request):
        start_time = request.query_params.get('startTime')
        end_time = request.query_params.get('endTime')
        
        if not start_time or not end_time:
            return Response({"error": "Start time and end time are required."}, status=400)

        sql = """
            SELECT cd.crm_cd, COUNT(*) AS report_count
            FROM Crime_report AS rpt
            JOIN Crime_code AS cd ON rpt.crm_cd = cd.crm_cd_id
            JOIN Timestamp AS ts ON rpt.timestamp_id = ts.timestamp_id
            WHERE ts.time_occ BETWEEN %s AND %s
            GROUP BY cd.crm_cd
            ORDER BY report_count DESC;
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [start_time, end_time])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"crm_cd": row[0], "report_count": row[1]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        

