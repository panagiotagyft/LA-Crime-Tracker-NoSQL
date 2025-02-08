from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query7View(APIView):
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
                    WITH AreaIncidentCounts AS (
                        SELECT area_id
                        FROM crime_report
                        JOIN Timestamp ON crime_report.timestamp_id = Timestamp.timestamp_id
                        WHERE date_occ BETWEEN %s AND %s
                        GROUP BY area_id
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                    )
                    SELECT 
                        cc1.crm_cd AS crime1,
                        cc2.crm_cd AS crime2,
                        COUNT(*) AS co_occurrence_count
                    FROM crime_report cr1
                    JOIN crime_report cr2 
                        ON cr1.area_id = cr2.area_id 
                        AND cr1.timestamp_id = cr2.timestamp_id
                        AND cr1.dr_no < cr2.dr_no
                    JOIN Crime_code cc1 ON cc1.crm_cd_id = cr1.crm_cd
                    JOIN Crime_code cc2 ON cc2.crm_cd_id = cr2.crm_cd AND cc1.crm_cd_id < cc2.crm_cd_id
                    JOIN Timestamp ts1 ON cr1.timestamp_id = ts1.timestamp_id
                    WHERE cr1.area_id = (SELECT area_id FROM AreaIncidentCounts)
                    AND ts1.date_occ >= %s AND ts1.date_occ <= %s
                    GROUP BY crime1, crime2
                    ORDER BY co_occurrence_count DESC;
                """
                cursor.execute(sql, [start_date, end_date, start_date, end_date])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Crime 1": row[0], "Crime 2": row[1], "Pair Count": row[2]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)