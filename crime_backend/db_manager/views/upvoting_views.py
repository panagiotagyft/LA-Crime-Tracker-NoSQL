from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

class UpvotinfView(APIView):
    def post(self, request):
        badge_number = request.data.get("BADGE_NO")
        dr_no = request.data.get("DR_NO")

        if not badge_number or not dr_no:
            return Response({"error": "Badge number and DR_NO are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the officer's votes from the 'upvotes' collection
            officer = db.upvotes.find_one({"badge_number": str(badge_number)}, {"_id": 0, "votes": 1})

            if officer:
                votes = officer.get("votes", [])
                
                # If the dr_no is already in the votes list, return an error
                if dr_no in votes:
                    return Response({"error": "DR_NO already voted by this officer"}, status=status.HTTP_400_BAD_REQUEST)

                # Add the new dr_no to the votes list
                db.upvotes.update_one(
                    {"badge_number": str(badge_number)},
                    {"$push": {"votes": dr_no}}
                )

                # Increment the upvote_count in the crime_reports collection
                db.crime_reports.update_one(
                    {"dr_no": int(dr_no)},
                    {"$inc": {"upvote_count": 1}}
                )

                return Response({"message": "Upvote successful"}, status=status.HTTP_200_OK)

            else:
                return Response({"error": "Badge number not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
