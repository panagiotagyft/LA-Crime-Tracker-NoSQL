from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class DropdownOptionsView(APIView):
    def get(self, request):
        option_type = request.query_params.get("type", None)

        # Σύνδεση στη MongoDB
        client = MongoClient("mongodb://localhost:27017/")
        db = client["crime_tracker"]

        try:
            if option_type == "area_codes":
                data_list = db.crime_reports.distinct("area.area_name")
            elif option_type == "crime_codes":
                data_list = db.crime_reports.distinct("crime_codes.crm_cd")
            elif option_type == "crime_codes_desc":
                data_list = db.crime_reports.distinct("crime_codes.crm_cd_desc")
            elif option_type == "premises":
                data_list = db.crime_reports.distinct("premises.premis_desc")
            elif option_type == "weapons":
                data_list = db.crime_reports.distinct("weapon.weapon_desc")
            elif option_type == "statuses":
                data_list = db.crime_reports.distinct("status.status_code")
            elif option_type == "rpt_dists":
                data_list = db.crime_reports.distinct("rpt_dist_no")
            elif option_type == "victims_sex":
                data_list = db.crime_reports.distinct("victim.sex")
            elif option_type == "victims_descent":
                data_list = db.crime_reports.distinct("victim.descent")
            else:
                return Response({"error": "Invalid option type"}, status=status.HTTP_400_BAD_REQUEST)

            data_list = sorted(data_list)  # Ταξινόμηση
            return Response({option_type: data_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetCodeDescriptionView(APIView):
    def get(self, request):
        table_name = request.query_params.get("type", None)
        code_value = request.query_params.get("code", None)

        if not table_name or not code_value:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["crime_tracker"]

        try:
            query = {}
            if table_name == "Area":
                query = {"area.area_name": code_value}
                description = db.crime_reports.find_one(query, {"area.area_name": 1})
            elif table_name == "Crime_code":
                query = {"crime_codes.crm_cd": int(code_value)}
                description = db.crime_reports.find_one(query, {"crime_codes.crm_cd_desc": 1})
            elif table_name == "Premises":
                query = {"premises.premis_cd": int(code_value)}
                description = db.crime_reports.find_one(query, {"premises.premis_desc": 1})
            elif table_name == "Weapon":
                query = {"weapon.weapon_desc": code_value}
                description = db.crime_reports.find_one(query, {"weapon.weapon_desc": 1})
            elif table_name == "Status":
                query = {"status.status_code": code_value}
                description = db.crime_reports.find_one(query, {"status.status_desc": 1})
            else:
                return Response({"error": "Invalid table name"}, status=status.HTTP_400_BAD_REQUEST)

            if description:
                return Response({"description": description}, status=status.HTTP_200_OK)
            return Response({"description": None}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SearchDRNumbersView(APIView):
    def get(self, request):
        query = request.query_params.get("query", "").strip()

        if not query:
            return Response({"dr_numbers": []}, status=status.HTTP_200_OK)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["crime_tracker"]

        try:
            results = db.crime_reports.find(
                {"dr_no": {"$regex": query, "$options": "i"}},  # Αναζήτηση με regex
                {"dr_no": 1}
            ).limit(50)

            dr_numbers = [result["dr_no"] for result in results]
            return Response({"dr_numbers": dr_numbers}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class GenerateDRNOView(APIView):
    def get(self, request):
        area_id = request.query_params.get("area_id", None)
        date_rptd = request.query_params.get("date_rptd", None)

        if not area_id or not date_rptd:
            return Response({"error": "Area ID and date are required"}, status=status.HTTP_400_BAD_REQUEST)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["crime_tracker"]

        try:
            date_rptd = datetime.strptime(date_rptd, "%Y-%m-%d")
            year = date_rptd.year

            # Βρες το επόμενο διαθέσιμο αριθμό
            next_record_number = db.crime_reports.count_documents({
                "area.area_id": area_id,
                "date_rptd": {"$regex": f"^{year}"}
            }) + 1

            year = year % 100  # Παίρνουμε τα δύο τελευταία ψηφία του έτους
            dr_no = f"{year:02}{int(area_id):02}{next_record_number:05}"

            return Response({"dr_no": dr_no}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class GetRecordByDRNOView(APIView):
    def get(self, request):
        dr_no = request.query_params.get("dr_no", None)

        if not dr_no:
            return Response({"error": "DR_NO is required"}, status=400)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["crime_tracker"]

        try:
            record = db.crime_reports.find_one({"dr_no": dr_no})

            if record:
                return Response(record, status=200)
            return Response({"error": "Record not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
