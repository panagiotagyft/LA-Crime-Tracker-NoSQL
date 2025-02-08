from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response

class Query9View(APIView):
    def get(self, request):

        try:
            
            with connection.cursor() as cursor:

                sql="""
                    WITH WeaponFrequency AS (
                        SELECT 
                            FLOOR(v.vict_age / 5) * 5 AS age_group,
                            w.weapon_cd,
                            w.weapon_desc,
                            COUNT(*) AS frequency
                        FROM victim v
                        JOIN Crime_report cr ON v.dr_no = cr.dr_no
                        JOIN Weapon w ON cr.weapon_cd = w.weapon_cd
                        WHERE v.vict_age IS NOT NULL AND v.vict_age > 0
                            AND w.weapon_cd > 0
                        GROUP BY age_group, w.weapon_cd, w.weapon_desc
                    )
                    SELECT DISTINCT ON (age_group) 
                        age_group, 
                        weapon_cd, 
                        weapon_desc, 
                        frequency
                    FROM WeaponFrequency
                    ORDER BY age_group, frequency DESC;
                """
                cursor.execute(sql)
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Age Group": row[0], "Most common weapon": row[1], "Occurrence Count": row[2]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        
