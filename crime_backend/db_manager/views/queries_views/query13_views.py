from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query13View(APIView):
    def get(self, request):
        print("Hello")
     
        def parse_time(time_str):
            return datetime.strptime(time_str, '%H:%M').time() if time_str else None

        start_time = parse_time(request.query_params.get('startTime'))
        end_time = parse_time(request.query_params.get('endTime'))
        N = int(request.query_params.get('N'))
        
        if not start_time or not end_time or not N:
            return Response({"error": "Start/End time and N are required."}, status=400)
    
        sql = """
            WITH Filtered_Crimes AS (
                SELECT 
                    cr.area_id AS area_id, 
                    cr.crm_cd AS crime_code_id,
                    cr.weapon_cd AS weapon_cd, 
                    ts.date_occ AS date,
                    COUNT(cr.dr_no) AS counter
                FROM Crime_report cr
                JOIN Timestamp ts ON cr.timestamp_id = ts.timestamp_id
                WHERE ts.time_occ BETWEEN %s AND %s
                GROUP BY cr.area_id, cr.crm_cd, cr.weapon_cd, ts.date_occ
                HAVING COUNT(cr.dr_no) = %s
            ),
            DRCODES AS (
                SELECT
                    cr.dr_no, 
                    cr.area_id AS area_id, 
                    cr.crm_cd AS crime_code_id, 
                    cr.weapon_cd AS weapon_cd,
                    ts.date_occ AS date 
                FROM Filtered_Crimes fc
                JOIN Timestamp ts ON ts.date_occ = fc.date
                JOIN Crime_report cr ON 
                    fc.area_id = cr.area_id AND 
                    fc.crime_code_id = cr.crm_cd AND
                    fc.weapon_cd = cr.weapon_cd AND
                    ts.timestamp_id = cr.timestamp_id
                ORDER BY cr.area_id, cr.crm_cd, cr.weapon_cd, ts.date_occ
            )
            SELECT d.dr_no, a.area_name, code.crm_cd_desc, wp.weapon_desc
            FROM DRCODES d
            JOIN Area a ON a.area_id = d.area_id
            JOIN Crime_code code ON code.crm_cd_id = d.crime_code_id
            JOIN Weapon wp ON wp.weapon_cd = d.weapon_cd
            WHERE code.crm_cd <> -1 AND wp.weapon_cd <> -1
            ORDER BY a.area_name, code.crm_cd_desc, wp.weapon_desc;
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [start_time, end_time, N])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"DR_NO": row[0], "Area name": row[1], "Crime code desc": row[2], "Weapon desc": row[3]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        

