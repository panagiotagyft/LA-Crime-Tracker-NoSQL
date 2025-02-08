from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime


class Query10View(APIView):
    def get(self, request):

        crime_code = request.query_params.get('crmCd')
        input_type = request.query_params.get('type')  # Retrieve 'type' from query params
        
        if not crime_code:
            return Response({"Error": "Crime code is required!"}, status=400)
        
        if input_type == 'area_name':
            sql = """
                -- Create a table with unique crime dates for each area
                WITH area_dates AS (
                    SELECT area_name, date.date_occ AS date
                    FROM Crime_report AS cr
                    INNER JOIN Area AS a ON a.area_id = cr.area_id
                    JOIN Crime_code AS code ON code.crm_cd_id = cr.crm_cd
                    JOIN Timestamp AS date ON date.timestamp_id = cr.timestamp_id
                    WHERE code.crm_cd = %s 
                    GROUP BY a.area_name, date.date_occ
                )

                -- Final query to find the longest time gap without the specific crime
                SELECT a1.area_name, 
                    a1.date AS start_date,  -- Start of the gap period
                    MIN(a2.date) AS end_date,  -- Earliest next date (end of the gap period)
                    MIN(a2.date) - a1.date AS gap  -- Calculate the time gap
                FROM area_dates AS a1
                INNER JOIN area_dates AS a2 ON a1.area_name = a2.area_name AND a1.date < a2.date  -- Ensure that a2.date is after a1.date
                GROUP BY a1.area_name, a1.date
                ORDER BY gap DESC  
                LIMIT 1;
            """
        else: 
            sql = """
                WITH rpt_dist_dates AS (
                    SELECT cr.rpt_dist_no AS rpt_dist_no, date.date_occ AS date
                    FROM Crime_report AS cr
                    JOIN Crime_code AS code ON code.crm_cd_id = cr.crm_cd
                    JOIN Timestamp AS date ON date.timestamp_id = cr.timestamp_id
                    WHERE code.crm_cd = %s 
                    GROUP BY cr.rpt_dist_no, date
                )

                SELECT a1.rpt_dist_no, a1.date AS start_date, MIN(a2.date) AS end_date, MIN(a2.date) - a1.date AS gap  
                FROM rpt_dist_dates AS a1
                INNER JOIN rpt_dist_dates AS a2 ON a1.rpt_dist_no = a2.rpt_dist_no AND a1.date < a2.date  
                GROUP BY a1.rpt_dist_no, a1.date
                ORDER BY gap DESC  
                LIMIT 1;
            """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [crime_code])
                rows = cursor.fetchall()
                
            if not rows:
                return Response({"message": "No data available for the given time range."}, status=200)
            
            if input_type == 'area_name':
                results = [{"area_name": row[0], "start_date": row[1], "end_date": row[2], "gap": row[3]} for row in rows]
            else:
                results = [{"rpt_dist_no": row[0], "start_date": row[1], "end_date": row[2], "gap": row[3]} for row in rows]
            
            return Response(results, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
