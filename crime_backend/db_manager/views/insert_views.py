from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

 # Connect to MongoDB and insert the document
client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]
crime_collection = db["crime_reports"]

class InsertView(APIView):
    def post(self, request):
        data = request.data

        try:

            # Remove empty fields
            filtered_data = {k: v for k, v in data.items() if v != ""}

            # Extract crime codes (filter out empty ones)
            crime_codes = [filtered_data[key] for key in ["CrmCd", "CrmCd2", "CrmCd3", "CrmCd4"] if key in filtered_data]

            # Find descriptions for all crime codes
            crime_desc_map = {}
            if crime_codes:
                crime_query = {"crime_codes.crm_cd": {"$in": [int(code) for code in crime_codes]}}  # Convert to int
                crime_docs = crime_collection.aggregate([
                    {"$unwind": "$crime_codes"},  # Unwind the array to get each crime separately
                    {"$match": crime_query},  # Match only required crime codes
                    {"$project": {"_id": 0, "crime_codes.crm_cd": 1, "crime_codes.crm_cd_desc": 1}}
                ])

                # Store crime descriptions in a dictionary
                for doc in crime_docs:
                    crime_desc_map[str(doc["crime_codes"]["crm_cd"])] = doc["crime_codes"]["crm_cd_desc"]

            # Build crime_codes list with descriptions
            crime_codes_list = [
                {"crm_cd": int(code), "crm_cd_desc": crime_desc_map.get(code, "UNKNOWN")} for code in crime_codes
            ]

            # Build the MongoDB document
            mongo_entry = {
                "dr_no": filtered_data.get("DR_NO"),
                "date_rptd": filtered_data.get("DateRptd"),
                "timestamp": {
                    "date_occ": filtered_data.get("DateOcc"),
                    "time_occ": filtered_data.get("TimeOcc")
                },
                "area": {
                    "area_id": int(filtered_data["AreaCode"]),
                    "area_name": filtered_data.get("AreaDesc")
                },
                "rpt_dist_no": int(filtered_data["RptDistNo"]),
                "crime_codes": crime_codes_list,  # Insert crime codes with descriptions
                "mocodes": filtered_data.get("Mocodes"),
                "victim": {
                    "age": int(filtered_data["VictAge"]),
                    "sex": filtered_data.get("VictSex"),
                    "descent": filtered_data.get("VictDescent")
                },
                "premises": {
                    "premis_cd": int(filtered_data["PremisCd"]),
                    "premis_desc": filtered_data.get("PremisesDesc")
                },
                "weapon": filtered_data.get("WeaponUsedCd"),
                "status": filtered_data.get("Status"),
                "location": {
                    "location": filtered_data.get("Location"),
                    "lat": float(filtered_data["Latitude"]),
                    "lon": float(filtered_data["Longitude"])
                },
                "upvote_count": 0  # Set to 0
            }

            # Insert the document into MongoDB
            collection = db["crime_reports"]
            insert_result = collection.insert_one(mongo_entry)

            # Print inserted document ID
            print(f"Inserted document ID: {insert_result.inserted_id}")

            return Response({'message': 'Record inserted successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


