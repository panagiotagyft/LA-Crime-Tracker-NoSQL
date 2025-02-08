from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class UpdateView(APIView):
    def post(self, request):
        print("Hello")
       
        items = list(request.data.items())
        print(items[0])  
        _, dr_no = items[0]
        dr_no=str(dr_no)

        if not dr_no:
            return Response({"error": "DR_NO is required"}, status=400)

        # Identify fields to be updated.
        fields_to_update = {key: value for key, value in request.data.items() if key != 'DR_NO' and value is not None}
        print(fields_to_update)
        if not fields_to_update:
            return Response({"error": "No fields to update"}, status=400)
 
        changes_log = [{"field": key, "new_value": value} for key, value in fields_to_update.items()]

        data_tables = {
            "DateRptd": "Crime_report",
            "DateOcc": "Timestamp",
            "TimeOcc": "Timestamp",
            "AreaCode": "Area",
            "AreaDesc": "Area",
            "PremisCd": "Premises",
            "PremisesDesc": "Premises",
            "CrmCd": "Crime_code",
            "Crime_codeDesc": "Crime_code",
            "CrmCd2": "Crime_report",
            "CrmCd3": "Crime_report",
            "CrmCd4": "Crime_report",
            "WeaponUsedCd": "Weapon",
            "WeaponDesc": "Weapon",
            "Location": "Crime_Location",
            "Latitude": "Crime_Location",
            "Longitude": "Crime_Location",
            "CrossStreet": "Crime_Location",
            "Status": "Status",
            "StatusDesc": "Status",
            "RptDistNo": "Crime_report",
            "Mocodes": "Crime_report",
            "VictAge": "Victim",
            "VictSex": "Victim",
            "VictDescent": "Victim",
        }

        tables_data = {
            "Area" : [],
            "Crime_Location" : [],
            "Status": [],
            "Premises": [],
            "Crime_code": [],
            "Weapon": [],
            "Timestamp": [],
            "Crime_report": [],
            "Victim": []
        }

        correctedField ={
            "DateRptd": "date_rptd",
            "DateOcc": "date_occ",
            "TimeOcc": "time_occ",
            "AreaCode": "area_id",
            "AreaDesc": "area_name",
            "PremisCd": "premis_cd",
            "PremisesDesc": "premis_desc",
            "WeaponUsedCd": "weapon_cd",
            "WeaponDesc": "weapon_desc",
            "Location": "location",
            "Latitude": "lat",
            "Longitude": "lon",
            "CrossStreet": "cross_street",
            "Status": "status_code",
            "StatusDesc": "status_desc",
            "RptDistNo": "rpt_dist_no",
            "Mocodes": "mocodes",
            "VictAge": "vict_age",
            "VictSex": "vict_sex",
            "VictDescent": "vict_descent", 
            "CrmCd": "crm_cd",
            "Crime_codeDesc": "crm_cd_desc",    
        }

        # Distribution of Data into tables_data
        for field, value in fields_to_update.items():
            table = data_tables.get(field)  # Find Which Table the Field Belongs To
            if table:
                tables_data[table].append({field: value})

        print("Tables Data:", tables_data)

        # 7. Executing Dynamic Updates with params = [fields_to_update[key] for key in field.keys()]
        try:
            with connection.cursor() as cursor:

                def parse_date(date_str):
                    return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

                def parse_time(time_str):
                    return datetime.strptime(time_str, '%H:%M').time() if time_str else None

                query = """ 
                    SELECT dr_no, date_rptd, timestamp_id, status_code, 
                           premis_cd, rpt_dist_no, area_id, location_id, 
                           mocodes, weapon_cd, crm_cd, crm_cd_2, crm_cd_3, 
                           crm_cd_4
                    FROM 
                        Crime_report 
                    WHERE 
                        dr_no = %s
                """
                cursor.execute(query, [dr_no])
                row = cursor.fetchone()
                print(row)
                print("line110")
                total_paramas_crm_rpt = {}
                for table, fields in tables_data.items():
                    if not fields: continue
                    print(f"line113 {fields}")
                    print(table)
                    if table == "Crime_Location" or table == "Victim":
                        conditions = []
                        for field in fields:
                            for key in field.keys():
                                conditions.append(f"{correctedField[key]} = %s")

                        set_clause = ", ".join(conditions)


                    if table == "Area":
                        cursor.execute("""
                            SELECT COUNT(*) FROM Area WHERE area_id = %s
                        """, (fields_to_update["AreaCode"],))
                        exists = cursor.fetchone()[0]

                        if exists == 0: 
                            params = []
                            for field in fields:
                                params += [fields_to_update[key] for key in field.keys()]

                            cursor.execute("""
                                INSERT INTO Area (area_id, area_name)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        total_paramas_crm_rpt[correctedField["AreaCode"]] = fields_to_update["AreaCode"]
                        print(f"line117 {total_paramas_crm_rpt[correctedField['AreaCode']]}")

                    # print("Crime_Location")
                    elif table == "Crime_Location":
                        print("Crime_Location")
                        cursor.execute("""
                            SELECT COUNT(*) FROM Crime_report WHERE location_id = %s
                        """, (row[7],))
                        records = cursor.fetchone()[0]

                        params = []
                        for field in fields:
                            params += [fields_to_update[key] for key in field.keys()]

                        if records > 1:
                            print(f"----- {records}")
                            cursor.execute("""
                                INSERT INTO Crime_Location (location, lat, lon, cross_street)
                                VALUES (%s, %s, %s, %s)
                            """, params)
                            connection.commit()
                            
                            cursor.execute("""
                                SELECT location_id, location, lat, lon, cross_street
                                FROM Crime_Location 
                                WHERE location = %s AND lat = %s AND lon = %s AND cross_street = %s
                            """, params)
                            location_id = cursor.fetchone()[0]
                            print(f"----- {row[7]}")
                            print(f"----- {location_id}")
                            total_paramas_crm_rpt["location_id"] = location_id

                        else:
                            params.append(row[7])   # location_id

                            sql = """
                                UPDATE Crime_Location 
                                SET {}
                                WHERE location_id = %s
                            """.format(set_clause)
                            cursor.execute(sql, params)
                            print("line143")

                    elif table == "Status":
                        cursor.execute("""
                            SELECT COUNT(*) FROM Status WHERE status_code = %s
                        """, (fields_to_update["Status"],))
                        exists = cursor.fetchone()[0]

                        if exists == 0: 
                            params = []
                            for field in fields:
                                params += [fields_to_update[key] for key in field.keys()]
                            cursor.execute("""
                                INSERT INTO Status (status_code, status_desc)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        total_paramas_crm_rpt[correctedField["Status"]] = fields_to_update["Status"]
                        print("line160")


                    elif table == "Premises":
                        cursor.execute("""
                            SELECT COUNT(*) FROM Premises WHERE premis_cd = %s
                        """, (fields_to_update["PremisCd"],))
                        exists = cursor.fetchone()[0]

                        if exists == 0: 
                            params = []
                            for field in fields:
                                params += [fields_to_update[key] for key in field.keys()]
                            cursor.execute("""
                                INSERT INTO Premises (premis_cd, premis_desc)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        total_paramas_crm_rpt[correctedField["PremisCd"]] = fields_to_update["PremisCd"]
                        print("line178")

                    elif table == "Crime_code":
                        cursor.execute("""
                            SELECT COUNT(*) FROM Crime_code WHERE crm_cd = %s
                        """, (fields_to_update["CrmCd"],))
                        exists = cursor.fetchone()[0]

                        if exists == 0: 
                            params = []
                            for field in fields:
                                params += [fields_to_update[key] for key in field.keys()]
                            cursor.execute("""
                                INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        cursor.execute("""
                            SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                        """, (fields_to_update["CrmCd"],))
                        crm_cd_id = cursor.fetchone()[0]
                            
                        total_paramas_crm_rpt[correctedField["CrmCd"]] = crm_cd_id
                        print("line200")

                    elif table == "Weapon":
                        cursor.execute("""
                            SELECT COUNT(*) FROM Weapon WHERE weapon_cd = %s
                        """, (fields_to_update["WeaponUsedCd"],))
                        exists = cursor.fetchone()[0]

                        if exists == 0: 
                            params = []
                            for field in fields:
                                params += [fields_to_update[key] for key in field.keys()]
                            cursor.execute("""
                                INSERT INTO Weapon (weapon_cd, weapon_desc)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        total_paramas_crm_rpt[correctedField["WeaponUsedCd"]] = fields_to_update["WeaponUsedCd"]
                        print("line217")

                    elif table == "Timestamp":
                        params = []
                        for field in fields:
                            params += [fields_to_update[key] for key in field.keys()]
                        
                        if len(params) == 1:
                            print("1 param")
                            key = list(field.keys())[0]
                            print(f"row[2] {row[2]}")
                            cursor.execute("""
                                SELECT date_occ, time_occ FROM Timestamp WHERE timestamp_id = %s 
                            """, [str(row[2])])
                            date_occ, time_occ = cursor.fetchone() 
                            print({date_occ, time_occ })
                            if key == "DateOcc":
                                params = [parse_date(fields_to_update[key]), time_occ]
                            else:
                                params = [date_occ, parse_time(fields_to_update[key])]
                                print("time")

                            
                        cursor.execute("""
                            SELECT COUNT(*) FROM Timestamp WHERE date_occ = %s AND time_occ = %s
                        """, params)
                        exists = cursor.fetchone()[0]
                        print(f"exists: {exists}")
                        if exists == 0: 
                            params = []
                            for field in fields:
                                key = list(field.keys())[0]

                                if key == "DateOcc": 
                                    params.insert(0, parse_date(fields_to_update[key]))
                                    params.append(time_occ)
                                else:
                                    params.append(date_occ)
                                    params.append(parse_time(fields_to_update[key]))  
                            print(params)
                            cursor.execute("""
                                INSERT INTO Timestamp (date_occ, time_occ)
                                VALUES (%s, %s)
                            """, params)
                            connection.commit()

                        cursor.execute("""
                            SELECT timestamp_id FROM Timestamp WHERE date_occ = %s AND time_occ = %s
                        """, params)
                        timestamp_id = cursor.fetchone()[0]

                        total_paramas_crm_rpt['timestamp_id'] = timestamp_id
                        print("line254")

                    elif table == "Victim":
                        params = []
                        for field in fields:
                            params += [fields_to_update[key] for key in field.keys()]
                        params.append(dr_no)   # location_id
                        print(params)
                        print(f"{set_clause}")
                        sql = """
                            UPDATE Victim
                            SET {}
                            WHERE dr_no = %s
                        """.format(set_clause)
                        cursor.execute(sql, params)
                        print("line264")


                    elif table == "Crime_report":
                        for field in fields:
                            for key in field.keys():
                                print(key)
                                if key == "CrmCd2" or key == "CrmCd3"  or key == "CrmCd4":
                                    
                                    cursor.execute("""
                                        SELECT COUNT(*) FROM Crime_code WHERE crm_cd = %s
                                    """, (fields_to_update[key],))
                                    exists = cursor.fetchone()[0]
                                    print(f"test1: {exists}")
                                    if exists == 0: 
                                        params = [fields_to_update[key]]
                                        params += ["No description"]
                                        cursor.execute("""
                                            INSERT INTO Crime_code (crm_cd, crm_cd_desc)
                                            VALUES (%s, %s)
                                        """, params)
                                        connection.commit()

                                    cursor.execute("""
                                        SELECT crm_cd_id FROM Crime_code WHERE crm_cd = %s
                                    """, (fields_to_update[key],))
                                    crm_cd_id = cursor.fetchone()[0]
                                    print(crm_cd_id)
                                    if key == "CrmCd2": total_paramas_crm_rpt["crm_cd_2"] = crm_cd_id
                                    elif key == "CrmCd3": total_paramas_crm_rpt["crm_cd_3"] = crm_cd_id
                                    elif key == "CrmCd4": total_paramas_crm_rpt["crm_cd_4"] = crm_cd_id

                                    continue

                                total_paramas_crm_rpt[correctedField[key]] = fields_to_update[key]
                                print("line296")

                
                keys = list(total_paramas_crm_rpt.keys())

                # Creation of the params1 List with Correct Data Types
                params1 = []
                for key in keys:
                    value = total_paramas_crm_rpt[key]
                    if key in ['area_id', 'premis_cd', 'crm_cd', 'weapon_cd', 'crm_cd_2', 'crm_cd_3', 'crm_cd_4', 'rpt_dist_no', 'timestamp_id']:
                        # convert to integer
                        params1.append(int(value))
                    elif key == 'date_rptd':
                        # Conversion to a Date Object (if Required)
                        params1.append(datetime.strptime(value, '%Y-%m-%d'))  # Ή datetime.strptime(value, '%Y-%m-%d') αν χρειάζεται
                    else:
                        # Keep as String
                        params1.append(value)
                
                # Append dr_no at the End
                params1.append(int(dr_no))
                set_clause = ', '.join([f"{key} = %s" for key in keys])
                print("Set Clause:", set_clause)
                print("Parameters:", params1)

                if len(params1) > 1:
                    sql = f"""
                        UPDATE Crime_report
                        SET {set_clause}
                        WHERE dr_no = %s
                    """
                    cursor.execute(sql, params1)


            return Response({"message": "Record updated successfully", "log": changes_log}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
