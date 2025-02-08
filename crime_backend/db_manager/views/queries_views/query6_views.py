from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime


class Query6View(APIView):
    def get(self, request):
        
        def parse_date(date_str):
            return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        start_date = parse_date(request.query_params.get('startDate'))
        end_date = parse_date(request.query_params.get('endDate'))
        input_type = request.query_params.get('type')  # Retrieve 'type' from query params
        
        if not start_date or not end_date:
            return Response({"Error": "Start/End date are required!"}, status=400)
        print(input_type)
        if input_type == 'area_name':
            sql = """
                SELECT area.area_name AS name, COUNT(report.dr_no) AS total_crimes
                FROM Crime_Report AS report
                JOIN Area ON area.area_id = report.area_id
                WHERE report.date_rptd BETWEEN %s AND %s
                GROUP BY area.area_name
                ORDER BY total_crimes DESC
                LIMIT 5
            """
        else: 
            sql = """
                SELECT rpt_dist_no, COUNT(dr_no) AS total_crimes
                FROM Crime_Report
                WHERE date_rptd BETWEEN %s AND %s
                GROUP BY rpt_dist_no
                ORDER BY total_crimes DESC
                LIMIT 5
            """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [start_date, end_date])
                rows = cursor.fetchall()
                
            if not rows:
                return Response({"message": "No data available for the given date range."}, status=200)
            
            if input_type == 'area_name':
                results = [{"area_name": row[0], "total_crimes": row[1]} for row in rows]
            else:
                results = [{"rpt_dist_no": row[0], "total_crimes": row[1]} for row in rows]
            
            return Response(results, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
