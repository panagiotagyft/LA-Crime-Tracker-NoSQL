from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

class DropdownOptionsView(APIView):
    def get(self, request):
        option_type = request.query_params.get("type", None)
        print(option_type)
      
        client = MongoClient("mongodb://localhost:27017/")
        db = client["NoSQL-LA-CRIME"]

        try:
            if option_type == "area_codes":
                data_list = db.crime_reports.distinct("area.area_id")

            elif option_type == "crime_codes":
                
                pipeline = [
                    {"$unwind": "$crime_codes"},  # Flatten the array
                    {"$group": {"_id": "$crime_codes.crm_cd"}},  # Extract unique values
                    {"$sort": {"_id": 1}}  # Sort the results
                ]
                data_list = [doc["_id"] for doc in db.crime_reports.aggregate(pipeline)]
                print(data_list)

            elif option_type == "premises":
                data_list = db.crime_reports.distinct("premises.premis_cd")

            elif option_type == "weapons":
                data_list = db.crime_reports.distinct("weapon")

            elif option_type == "statuses":
                data_list = db.crime_reports.distinct("status")

            elif option_type == "rpt_dists":
                data_list = db.crime_reports.distinct("rpt_dist_no")

            elif option_type == "victims_sex":
                data_list = db.crime_reports.distinct("victim.sex")

            elif option_type == "victims_descent":
                data_list = db.crime_reports.distinct("victim.descent")
                
            elif option_type == "office_name":
                data_list = db.upvotes.distinct("name")
            else:
                return Response({"error": "Invalid option type"}, status=status.HTTP_400_BAD_REQUEST)

            # data_list = sorted(data_list)  # Ταξινόμηση
            print(data_list)
            return Response({option_type: data_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetCodeDescriptionView(APIView):
    def get(self, request):
        table_name = request.query_params.get("type", None)
        code_value = request.query_params.get("code", None)
        print(table_name)
        print(code_value)
        if not table_name or not code_value:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["NoSQL-LA-CRIME"]

        try:
            query = {}
            if table_name == "Area":
                query = {"area.area_id": int(code_value)}
                result = db.crime_reports.find_one(query, {"area.area_name": 1, "_id": 0})
                if result and "area" in result:
                    description = result["area"]["area_name"]

            elif table_name == "Crime_code":
                pipeline = [
                    {"$unwind": "$crime_codes"},  # Flatten the crime_codes array
                    {"$match": {"crime_codes.crm_cd": int(code_value)}},  # Filter by crime code
                    {"$project": {"_id": 0, "crime_codes.crm_cd_desc": 1}}  # Keep only crm_cd_desc
                ]

                result = db.crime_reports.aggregate(pipeline)

                description = None
                for doc in result:
                    description = doc["crime_codes"]["crm_cd_desc"]
                    break  # Get the first match

            elif table_name == "Premises":
                query = {"premises.premis_cd": int(code_value)}
                result = db.crime_reports.find_one(query, {"premises.premis_desc": 1, "_id": 0})
                if result and "premises" in result:
                    description = result["premises"]["premis_desc"]

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
        db = client["NoSQL-LA-CRIME"]

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

        try:
            # Convert area_id to int
            area_id = int(area_id)

            # Convert date_rptd to datetime format
            date_rptd = datetime.strptime(date_rptd, "%Y-%m-%d")
            year = date_rptd.year % 100  # Extract last two digits of the year

            client = MongoClient("mongodb://localhost:27017/")
            db = client["NoSQL-LA-CRIME"]

            # Define the DR_NO range for the given year and area
            min_dr_no = int(f"{year:02}{area_id:02}00000")  # Example: 200700000
            max_dr_no = int(f"{year:02}{area_id:02}99999")  # Example: 200799999

            # Find the latest DR_NO for the given area and year
            last_record = db.crime_reports.find_one(
                {"area.area_id": area_id, "dr_no": {"$gte": min_dr_no, "$lte": max_dr_no}},
                sort=[("dr_no", -1)]  # Sort in descending order to get the highest DR_NO
            )

            if last_record and "dr_no" in last_record:
                last_dr_no = last_record["dr_no"]
                next_record_number = int(str(last_dr_no)[-5:]) + 1  # Extract last 5 digits and increment
            else:
                next_record_number = 1  # If no previous DR_NO exists, start from 00001

            # Generate new DR_NO
            dr_no = int(f"{year:02}{area_id:02}{next_record_number:05}")

            return Response({"dr_no": dr_no}, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"error": "Invalid area_id or date format"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetRecordByDRNOView(APIView):
    def get(self, request):
        dr_no = request.query_params.get("dr_no", None)

        if not dr_no:
            return Response({"error": "DR_NO is required"}, status=400)

        client = MongoClient("mongodb://localhost:27017/")
        db = client["NoSQL-LA-CRIME"]

        try:
            record = db.crime_reports.find_one({"dr_no": dr_no})

            if record:
                return Response(record, status=200)
            return Response({"error": "Record not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
