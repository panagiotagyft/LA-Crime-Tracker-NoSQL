from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.paginator import Paginator

class SearchView(APIView):
    def get(self, request):
        area_name = request.query_params.get('area_name')
        
        if not area_name:
            return Response({"error": "Area selection is required."}, status=400)

        sql = """
            SELECT cr.dr_no, cr.date_rptd, ts.date_occ, ts.time_occ, s.status_code, s.status_desc,
                  p.premis_cd, p.premis_desc, cr.rpt_dist_no, a.area_id, a.area_name, 
                  loc.location_id, loc.location, loc.lat, loc.lon, loc.cross_street,
                  cr.mocodes, wp.weapon_cd, wp.weapon_desc, cr.crm_cd, crm_cd.crm_cd_desc, cr.crm_cd_2, cr.crm_cd_3, cr.crm_cd_4,
                  v.vict_id, v.vict_age, v.vict_sex, v.vict_descent
            FROM Crime_report AS cr
            JOIN Timestamp AS ts ON ts.timestamp_id = cr.timestamp_id
            JOIN Premises AS p ON p.premis_cd = cr.premis_cd
            JOIN Area AS a ON a.area_id = cr.area_id
            JOIN Crime_Location AS loc ON loc.location_id = cr.location_id
            JOIN Crime_code AS crm_cd ON crm_cd.crm_cd_id = cr.crm_cd
            JOIN Weapon AS wp ON cr.weapon_cd = wp.weapon_cd
            JOIN Status AS s ON s.status_code = cr.status_code
            JOIN Victim AS v ON v.dr_no = cr.dr_no
            WHERE a.area_name = %s
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql, [area_name])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"DR_NO": row[0], 
                        "Date Rptd": row[1], 
                        "Date": row[2], 
                        "Time": row[3], 
                        "Status": row[4], 
                        "Status Desc": row[5],
                        "Premis code": row[6], 
                        "Premis code desc": row[7], 
                        "rpt_dist_no": row[8], 
                        "Area ID": row[9], 
                        "Area Name": row[10],
                        "Loacation ID": row[11], 
                        "Location": row[12], 
                        "Latitude": row[13], 
                        "Longtitude": row[14], 
                        "Cross Street": row[15],
                        "Mocodes": row[16], 
                        "Weapon Code": row[17], 
                        "Weapon code desc": row[18], 
                        "Crime code 1": row[19], 
                        "Crime code 1 desc": row[20],
                        "Crime code 2": row[21], 
                        "Crime code 3": row[22],
                        "Crime code 4": row[23], 
                        "Victim ID": row[24], 
                        "Victim age": row[25],
                        "Victim sex": row[26],  
                        "Victim descent": row[27]} for row in rows]


            paginator = Paginator(results, 500)  # 50 εγγραφές ανά σελίδα
            page_number = request.query_params.get('page', 1)
            page = paginator.get_page(page_number)
            
            return Response({
                "results": list(page),
                "total": paginator.count,
                "pages": paginator.num_pages,
                "current_page": page.number,
            }, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        
