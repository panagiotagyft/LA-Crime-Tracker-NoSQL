from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query3View(APIView):
    def get(self, request):

        def parse_date(date_str):
            return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        date = parse_date(request.query_params.get('date'))

        if not date:
            return Response({"Error": "Date is required!!"}, status=400)
  
        try:
            with connection.cursor() as cursor:

                sql="""
                    WITH FilteredCrimes AS (
                        SELECT Area.area_id, Crime_report.crm_cd, crm_cd_2, crm_cd_3, crm_cd_4
                        FROM Crime_report
                        JOIN Area ON Crime_report.area_id = Area.area_id
                        WHERE date_rptd = %s
                    ),
                    FlattenedCrimes AS (
                        SELECT area_id, FilteredCrimes.crm_cd AS crime_code
                        FROM FilteredCrimes
                        UNION ALL
                        SELECT area_id, FilteredCrimes.crm_cd_2 AS crime_code
                        FROM FilteredCrimes
                        UNION ALL
                        SELECT area_id, FilteredCrimes.crm_cd_3 AS crime_code
                        FROM FilteredCrimes
                        UNION ALL
                        SELECT area_id, crm_cd_4 AS crime_code
                        FROM FilteredCrimes
                    ),
                    CrimeCounts AS (
                        SELECT area_id, crime_code, COUNT(*) AS crime_count
                        FROM FlattenedCrimes
                        GROUP BY area_id, crime_code
                    )
                    SELECT DISTINCT ON (CrimeCounts.area_id)
                        CrimeCounts.area_id,
                        Crime_code.crm_cd,
                        CrimeCounts.crime_count
                    FROM CrimeCounts
                    JOIN Crime_code ON CrimeCounts.crime_code = Crime_code.crm_cd_id
                    WHERE Crime_code.crm_cd != -1
                    ORDER BY CrimeCounts.area_id, crime_count DESC;
                """
                cursor.execute(sql, [date])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Area Code": row[0], "The most frequent crime": row[1]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        