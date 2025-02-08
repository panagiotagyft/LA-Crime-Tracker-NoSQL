from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query11View(APIView):
    def get(self, request):
        
        crime_code1 = request.query_params.get('crmCd1')
        crime_code2 = request.query_params.get('crmCd2')
        print(crime_code1)
        print(crime_code2)
        if not crime_code1 or not crime_code2:
            return Response({"Error": "Crime codes 1 & 2 are required!"}, status=400)
        
        sql = """
            WITH FilteredCrimes AS (
                SELECT 
                    a.area_name, 
                    ts.date_occ AS report_date, 
                    cc.crm_cd_desc,
                    COUNT(*) AS report_count
                FROM crime_report cr
                JOIN area a ON cr.area_id = a.area_id
                JOIN Crime_code cc ON cr.crm_cd = cc.crm_cd_id
                JOIN Timestamp ts ON cr.timestamp_id = ts.timestamp_id
                WHERE cc.crm_cd_desc IN (%s, %s) 
                GROUP BY a.area_name, ts.date_occ, cc.crm_cd_desc
            ),
            CrimeCounts AS (
                SELECT 
                    area_name, 
                    report_date,
                    COUNT(DISTINCT crm_cd_desc) AS distinct_crimes,
                    report_count
                FROM FilteredCrimes
                GROUP BY area_name, report_date, report_count
            )
            SELECT 
                area_name
            FROM CrimeCounts
            WHERE distinct_crimes = 2
            GROUP BY area_name
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [crime_code1, crime_code2])
                rows = cursor.fetchall()
                
            print(rows)
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given crime codes."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Area": row[0]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        
