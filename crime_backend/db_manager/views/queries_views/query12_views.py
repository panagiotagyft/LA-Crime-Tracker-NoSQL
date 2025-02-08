from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query12View(APIView):
    def get(self, request):
        print("Hello")
        def parse_time(time_str):
            return datetime.strptime(time_str, '%H:%M').time() if time_str else None

        start_time = parse_time(request.query_params.get('startTime'))
        end_time = parse_time(request.query_params.get('endTime'))
        
        if not start_time or not end_time:
            return Response({"error": "Start time and end time are required."}, status=400)
    
        sql = """
            WITH dr_date_weapon AS(
                SELECT cr.dr_no, cr.date_rptd, cr.weapon_cd, cr.area_id
                FROM Crime_report AS cr
                JOIN Timestamp AS time ON time.timestamp_id = cr.timestamp_id
                WHERE time.time_occ BETWEEN %s AND %s AND cr.weapon_cd <> -1
                GROUP BY cr.dr_no, cr.date_rptd, cr.weapon_cd, cr.area_id
                ORDER BY cr.date_rptd, cr.weapon_cd, cr.area_id
            ),
            RemoveDuplicates AS(
                SELECT date_rptd, weapon_cd, area_id
                FROM dr_date_weapon 
                GROUP BY date_rptd, weapon_cd, area_id
                HAVING COUNT(area_id) = 1
                ORDER BY date_rptd, weapon_cd, area_id
            ),
            AllRes AS (
                SELECT date_rptd, weapon_cd, COUNT(*) as num_drno
                FROM RemoveDuplicates
                GROUP BY date_rptd, weapon_cd
            )
            SELECT date_rptd, weapon_cd, num_drno
            FROM AllRes
            WHERE num_drno > 1;
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [start_time, end_time])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Reported day": row[0], "Weapon code": row[1], "Number of division of records": row[2]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        

