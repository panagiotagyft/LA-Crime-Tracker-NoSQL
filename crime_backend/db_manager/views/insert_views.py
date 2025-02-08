from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

class InsertView(APIView):
    def post(self, request):
        data = request.data

        try:
            with connection.cursor() as cursor:
                # ---------------------------------------------------------------------
                # ------------------------    Data Parsing    -------------------------
                # ---------------------------------------------------------------------

                # Functions for parsing dates and times
                def parse_date(date_str):
                    return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

                def parse_time(time_str):
                    return datetime.strptime(time_str, '%H:%M').time() if time_str else None

                # Extract data from the request
                dr_no = data.get('DR_NO')
                date_rptd = parse_date(data.get('DateRptd'))
                date_occ = parse_date(data.get('DateOcc'))
                time_occ = parse_time(data.get('TimeOcc'))
                area_id = data.get('AreaCode')
                area_name = data.get('AreaDesc')
                premis_cd = data.get('PremisCd')
                premis_desc = data.get('PremisesDesc')
                crm_cd = data.get('CrmCd')
                crime_code_desc = data.get('Crime_codeDesc')
                crm_cd2 = data.get('CrmCd2') or None
                crm_cd3 = data.get('CrmCd3') or None
                crm_cd4 = data.get('CrmCd4') or None
                weapon_cd = data.get('WeaponUsedCd')
                weapon_desc = data.get('WeaponDesc')
                location = data.get('Location')
                lat = data.get('Latitude')
                lon = data.get('Longitude')
                cross_street = data.get('CrossStreet')
                status_code = data.get('Status')
                status_desc = data.get('StatusDesc')
                rpt_dist_no = data.get('RptDistNo') or None
                mocodes = data.get('Mocodes')
                vict_age = data.get('VictAge')
                vict_sex = data.get('VictSex')
                vict_descent = data.get('VictDescent')

                # Convert types where necessary
                lat = float(lat) if lat else None
                lon = float(lon) if lon else None
                premis_cd = int(premis_cd) if premis_cd else None
                weapon_cd = int(weapon_cd) if weapon_cd else None
                crm_cd = int(crm_cd) if crm_cd else None
                crm_cd2 = int(crm_cd2) if crm_cd2 else None
                crm_cd3 = int(crm_cd3) if crm_cd3 else None
                crm_cd4 = int(crm_cd4) if crm_cd4 else None
                rpt_dist_no = int(rpt_dist_no) if rpt_dist_no else None
                vict_age = int(vict_age) if vict_age else None

                # ---------------------------------------------------------------------
                # Insert data into the -- Area -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Area (area_id, area_name)
                        VALUES (%s, %s)
                        ON CONFLICT (area_id) DO NOTHING
                    """, [area_id, area_name])
               
                # ---------------------------------------------------------------------
                # Insert data into the -- Crime_Location -- table
                with connection.cursor() as cursor:
                    # Check if location already exists
                    cursor.execute("""
                        INSERT INTO Crime_Location (location, lat, lon, cross_street)
                        VALUES (%s, %s, %s, %s)
                    """, (location, lat, lon, cross_street) )
                    connection.commit()
                    
                    cursor.execute("""
                        SELECT location_id, location, lat, lon, cross_street
                        FROM Crime_Location 
                        WHERE location = %s AND lat = %s AND lon = %s AND cross_street = %s
                    """, (location, lat, lon, cross_street))
                    location_id = cursor.fetchone()[0]
                    
                    
               
                # ---------------------------------------------------------------------
                # Insert data into the -- Status -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Status (status_code, status_desc)
                        VALUES (%s, %s)
                        ON CONFLICT (status_code) DO NOTHING
                    """, [status_code, status_desc])
                    connection.commit()
               
                # ---------------------------------------------------------------------
                # Insert data into the -- Premises -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Premises (premis_cd, premis_desc)
                        VALUES (%s, %s)
                        ON CONFLICT (premis_cd) DO NOTHING
                    """, [premis_cd, premis_desc])
                    connection.commit()
               
                # ---------------------------------------------------------------------
                # Insert data into the -- Weapon -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Weapon (weapon_cd, weapon_desc)
                        VALUES (%s, %s)
                        ON CONFLICT (weapon_cd) DO NOTHING
                    """, [weapon_cd, weapon_desc])
                    connection.commit()
               
                # ---------------------------------------------------------------------
                # Insert data into the -- Crime_code -- table
                # Insert main crime code
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                        VALUES (%s, %s)
                    """, [crm_cd, crime_code_desc])
                    connection.commit()
                    
                    cursor.execute("""
                        SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd,))
                    crm_cd_id = cursor.fetchone()
                    
                    cursor.execute("""
                        SELECT COUNT(*) FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd2,))
                    exists = cursor.fetchone()[0]

                    if exists == 0: 
                        cursor.execute("""
                            INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                            VALUES (%s, %s)
                        """, [crm_cd2, 'No description'])
                        connection.commit()
                        
                    cursor.execute("""
                        SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd2,))
                    crm_cd2_id = cursor.fetchone()[0]

                    cursor.execute("""
                        SELECT COUNT(*) FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd3,))
                    exists = cursor.fetchone()[0]

                    if exists == 0: 
                        cursor.execute("""
                            INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                            VALUES (%s, %s)
                        """, [crm_cd3, 'No description'])
                        connection.commit()
                        
                    cursor.execute("""
                        SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd3,))
                    crm_cd3_id = cursor.fetchone()[0]

                    cursor.execute("""
                        SELECT COUNT(*) FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd4,))
                    exists = cursor.fetchone()[0]

                    if exists == 0: 
                        cursor.execute("""
                            INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                            VALUES (%s, %s)
                        """, [crm_cd4, 'No description'])
                        connection.commit()
                        
                    cursor.execute("""
                        SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                    """, (crm_cd4,))
                    crm_cd4_id = cursor.fetchone()[0]

               
                # ---------------------------------------------------------------------
                # Insert data into the -- Timestamp -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Timestamp (date_occ, time_occ)
                        VALUES (%s, %s)
                    """, [date_occ, time_occ])
                    # Retrieve timestamp_id
                    cursor.execute("SELECT timestamp_id FROM Timestamp WHERE date_occ = %s AND time_occ = %s", [date_occ, time_occ])
                    timestamp_id = cursor.fetchone()[0]
              
                # ---------------------------------------------------------------------
                # # Insert data into the -- Reporting_District -- table
                # if rpt_dist_no and area_id:
                #     with connection.cursor() as cursor:
                #         cursor.execute("""
                #             INSERT INTO Reporting_District (rpt_dist_no, area_id)
                #             VALUES (%s, %s)
                #             ON CONFLICT (rpt_dist_no) DO NOTHING
                #         """, [rpt_dist_no, area_id])
                # print('line359')
                # ---------------------------------------------------------------------
                # Insert data into the -- Crime_report -- table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO Crime_report (
                            dr_no, date_rptd, timestamp_id, status_code, premis_cd, rpt_dist_no,
                            area_id, location_id, mocodes, weapon_cd, crm_cd, crm_cd_2, crm_cd_3, crm_cd_4
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, [
                        dr_no, date_rptd, timestamp_id, status_code, premis_cd, rpt_dist_no,
                        area_id, location_id, mocodes, weapon_cd, crm_cd_id,
                        crm_cd2_id, crm_cd3_id, crm_cd4_id
                    ])
             
                # ---------------------------------------------------------------------
                # Insert data into the -- Victim -- table
                if vict_age or vict_sex or vict_descent:
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO Victim (
                                dr_no, vict_age, vict_sex, vict_descent
                            ) VALUES (%s, %s, %s, %s)
                        """, [
                            dr_no, vict_age, vict_sex, vict_descent
                        ])
             
                return Response({'message': 'Record inserted successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


