from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query2View(APIView):
    def get(self, request):

        def parse_time(time_str):
            return datetime.strptime(time_str, '%H:%M').time() if time_str else None

        start_time = parse_time(request.query_params.get('startTime'))
        end_time = parse_time(request.query_params.get('endTime'))
        crime_code = request.query_params.get('crmCd')

        if not start_time or not end_time or not crime_code:
            return Response({"Error": "Start/End time and crime code are required!!"}, status=400)
        try:
            with connection.cursor() as cursor:

                sql="""
                    SELECT report.date_rptd, COUNT(report.dr_no) as total_reports
                    FROM Crime_Report AS report
                    JOIN Timestamp AS time ON report.timestamp_id = time.timestamp_id
                    JOIN Crime_code AS code ON report.crm_cd = code.crm_cd_id
                    WHERE code.crm_cd = %s AND time.time_occ BETWEEN %s AND %s 
                    GROUP BY report.date_rptd
                    ORDER BY total_reports DESC;
                """
                cursor.execute(sql, [crime_code, start_time, end_time])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Reported Day": row[0], "Total number of reports": row[1]} for row in rows]

            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        

