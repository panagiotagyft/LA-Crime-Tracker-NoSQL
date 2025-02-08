from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

class DropdownOptionsView(APIView):
    def get(self, request):
        option_type = request.query_params.get('type', None)

        try:
            with connection.cursor() as cursor:
                if option_type == "area_codes":
                    cursor.execute("SELECT area_id FROM Area")
                    area_codes = [row[0] for row in cursor.fetchall()]
                    area_codes = sorted(area_codes)
                    data_list = area_codes
                
                elif option_type == "area_names": 
                    cursor.execute("SELECT area_name FROM Area")
                    area_names = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(area_names)
                   
                elif option_type == "crime_codes": 
                    cursor.execute("""SELECT DISTINCT crm_cd FROM Crime_code""")
                    crime_codes = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(crime_codes)

                elif option_type == "crime_codes_desc": 
                    cursor.execute("""SELECT DISTINCT crm_cd_desc FROM Crime_code""")
                    crime_codes_desc = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(crime_codes_desc)
                    
                elif option_type == "premises":
                    cursor.execute("""SELECT premis_cd FROM Premises""")
                    premises = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(premises)
                    
                elif option_type == "weapons":
                    cursor.execute("""SELECT weapon_cd FROM Weapon""")
                    weapons = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(weapons)
                  
                elif option_type == "statuses":
                    cursor.execute("SELECT status_code FROM Status")
                    statuses = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(statuses)
                   
                elif option_type == "rpt_dists":
                    cursor.execute("SELECT rpt_dist_no FROM Crime_report")
                    rpt_dists = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(list(set(rpt_dists)))
                   
                elif option_type == "victims_sex":
                    cursor.execute("SELECT vict_sex FROM Victim")
                    victims_sex = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(dict.fromkeys(victims_sex))
                    
                elif option_type == "victims_descent":
                    cursor.execute("SELECT vict_descent FROM Victim")
                    victims_descent = [row[0] for row in cursor.fetchall()]
                    data_list = sorted(dict.fromkeys(victims_descent))
                    

            data = { option_type: data_list }

            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetCodeDescriptionView(APIView):
    def get(self, request):
        table_name = request.query_params.get('type', None)
        code_value = request.query_params.get('code', None)
        # print(table_name)
        # print(code_value)
        if not table_name or not code_value:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
              
                if table_name == "Area": query = f"SELECT area_name FROM Area WHERE area_id = %s"
                if table_name == "Crime_code": query = f"SELECT crm_cd_desc FROM Crime_code WHERE crm_cd = %s"
                if table_name == "Premises": query = f"SELECT premis_desc FROM Premises WHERE premis_cd = %s"
                if table_name == "Weapon": query = f"SELECT weapon_desc FROM Weapon WHERE weapon_cd = %s"
                if table_name == "Status": query = f"SELECT status_desc FROM Status WHERE status_code = %s"

                cursor.execute(query, [code_value])
                row = cursor.fetchone()

            # print(row)
            if row:
                return Response({"description": row[0]}, status=status.HTTP_200_OK)
            return Response({"description": None}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SearchDRNumbersView(APIView):
    def get(self, request):
        
        query = request.query_params.get('query', '').strip()
        
        if not query:
            return Response({"dr_numbers": []}, status=status.HTTP_200_OK)
        
        try:
            with connection.cursor() as cursor:
               
                cursor.execute(
                    "SELECT dr_no FROM Crime_report WHERE CAST(dr_no AS TEXT) LIKE %s LIMIT 50",
                    [f"%{query}%"]
                )
                dr_numbers = [row[0] for row in cursor.fetchall()]
            return Response({"dr_numbers": dr_numbers}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateDRNOView(APIView):
    def get(self, request):
        area_id = request.query_params.get('area_id', None)
        date_rptd = request.query_params.get('date_rptd', None)
        print(f"Received area_id: {area_id}, date_rptd: {date_rptd}")

        if not area_id or not date_rptd:
            return Response({"error": "Area ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date_rptd = datetime.strptime(date_rptd, "%Y-%m-%d")
            year = date_rptd.year 
            print(year)
            print(date_rptd)
            with connection.cursor() as cursor:
                # Find the Next Available Number for the Specific Area ID and date_rptd
                query = """
                    SELECT COUNT(*) + 1 
                    FROM Crime_report 
                    WHERE area_id = %s AND EXTRACT(YEAR FROM date_rptd) = %s;
                """
                cursor.execute(query, [area_id, year])
                next_record_number = cursor.fetchone()[0]
                print(next_record_number)
            year = year % 100
            # Generate the DR_NO
            dr_no = f"{year:02}{int(area_id):02}{next_record_number:05}"
            print(dr_no)
            return Response({"dr_no": dr_no}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetRecordByDRNOView(APIView):
    def get(self, request):
        dr_no = request.query_params.get('dr_no')
        if not dr_no:
            return Response({"error": "DR_NO is required"}, status=400)
        try:
            with connection.cursor() as cursor:
                query = """ 
                    SELECT cr.dr_no, cr.date_rptd, ts.date_occ, ts.time_occ,
                        a.area_id, a.area_name AS area_desc, cr.rpt_dist_no,
                        p.premis_cd, p.premis_desc,
                        cc1.crm_cd AS crm_cd1, cc1.crm_cd_desc AS crm_cd1_desc,
                        cc2.crm_cd AS crm_cd2, cc3.crm_cd AS crm_cd3, cc4.crm_cd AS crm_cd4,
                        w.weapon_cd, w.weapon_desc,
                        cl.location, cl.lat AS latitude, cl.lon AS longitude, cl.cross_street,
                        s.status_code, s.status_desc,
                        cr.mocodes, v.vict_age, v.vict_sex, v.vict_descent
                    FROM 
                        Crime_report cr
                    LEFT JOIN Timestamp ts ON cr.timestamp_id = ts.timestamp_id
                    LEFT JOIN Area a ON cr.area_id = a.area_id
                    LEFT JOIN Premises p ON cr.premis_cd = p.premis_cd
                    LEFT JOIN Crime_code cc1 ON cr.crm_cd = cc1.crm_cd_id
                    LEFT JOIN Crime_code cc2 ON cr.crm_cd_2 = cc2.crm_cd_id
                    LEFT JOIN Crime_code cc3 ON cr.crm_cd_3 = cc3.crm_cd_id
                    LEFT JOIN Crime_code cc4 ON cr.crm_cd_4 = cc4.crm_cd_id
                    LEFT JOIN Weapon w ON cr.weapon_cd = w.weapon_cd
                    LEFT JOIN Crime_Location cl ON cr.location_id = cl.location_id
                    LEFT JOIN Status s ON cr.status_code = s.status_code
                    LEFT JOIN Victim v ON cr.dr_no = v.dr_no
                    WHERE 
                        cr.dr_no = %s
                """
                cursor.execute(query, [dr_no])
                row = cursor.fetchone()
                print(row)
                if row:
                    # Map the fields to a dictionary
                    keys = [
                        "DR_NO", "DateRptd", "DateOcc", "TimeOcc", "AreaCode", "AreaDesc",
                        "RptDistNo", "PremisCd", "PremisesDesc", "CrmCd", "Crime_codeDesc",
                        "CrmCd2", "CrmCd3", "CrmCd4",
                        "WeaponUsedCd", "WeaponDesc", "Location", "Latitude", "Longitude", 
                        "CrossStreet", "Status", "StatusDesc",  "Mocodes", "VictAge", 
                        "VictSex", "VictDescent"
                    ]
                    return Response(dict(zip(keys, row)), status=200)
                return Response({"error": "Record not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)