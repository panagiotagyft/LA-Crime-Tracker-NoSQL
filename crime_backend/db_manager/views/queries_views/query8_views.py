from django.db import connection 
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class Query8View(APIView):
    def get(self, request):

        def parse_date(date_str):
            return datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
        
        start_date = parse_date(request.query_params.get('startDate'))
        end_date = parse_date(request.query_params.get('endDate'))
        crime_code = request.query_params.get('crmCd')
        
        if not start_date or not end_date or not crime_code:
            return Response({"Error": "Start/End date and crime code are required!"}, status=400)
       
        try:
            with connection.cursor() as cursor:

                sql="""
                    WITH AllPairs AS (
                        -- Step 1: Generate all possible pairs of crimes using a self-join
                        SELECT 
                            c1.crm_cd AS crime1, c1.crm_cd_id AS crime1_id, -- The first crime in the pair
                            c2.crm_cd AS crime2, c2.crm_cd_id AS crime2_id  -- The second crime in the pair
                        FROM 
                            Crime_code c1
                        INNER JOIN 
                            Crime_code c2 ON c1.crm_cd_id < c2.crm_cd_id -- Ensure unique pairs by comparing IDs
                        WHERE c1.crm_cd <> c2.crm_cd AND c1.crm_cd <> -1 AND c2.crm_cd <> -1
                    ),
                    FilteredPairs AS (
                        -- Step 2: Filter pairs involving the specific crime
                        SELECT
                            crime1, crime1_id,
                            crime2, crime2_id
                        FROM 
                            AllPairs 
                        WHERE 
                            %s IN (crime1, crime2)
                    ),
                    PairOccurrences AS (
                        -- Step 3: Find matching records for each pair and group them
                        SELECT
                            fp.crime1, -- The first crime in the pair
                            fp.crime2, -- The second crime in the pair
                            cr.dr_no -- Unique incident identifier
                        FROM FilteredPairs AS fp
                        JOIN Crime_report cr ON (
                                (fp.crime1_id = cr.crm_cd OR fp.crime1_id = cr.crm_cd_2 OR fp.crime1_id = cr.crm_cd_3 OR fp.crime1_id = cr.crm_cd_4)
                                AND
                                (fp.crime2_id = cr.crm_cd OR fp.crime2_id = cr.crm_cd_2 OR fp.crime2_id = cr.crm_cd_3 OR fp.crime2_id = cr.crm_cd_4)
                            )
                        WHERE cr.date_rptd BETWEEN %s AND %s
                    ),
                    GroupedPairCounts AS (
                        -- Step 4: Count the number of occurrences for each pair
                        SELECT crime1, crime2, COUNT(*) AS pair_count -- Count how many times this pair occurred
                        FROM PairOccurrences 
                        GROUP BY crime1, crime2 -- Group by each unique pair
                    )
                    -- Step 5: Sort the results by the number of occurrences
                    SELECT crime1, crime2, pair_count 
                    FROM  GroupedPairCounts
                    ORDER BY pair_count DESC
                    LIMIT 1 OFFSET 1;
                """
                cursor.execute(sql, [crime_code, start_date, end_date])
                rows = cursor.fetchall()
                
            if not rows:  # Check if the list is empty.
                return Response({"message": "No data available for the given time range."}, status=200)
            
            # Formatting results in JSON.
            results = [{"Crime 1": row[0], "Crime 2": row[1], "Pair Count": row[2]} for row in rows]
            return Response(results, status=200)
        
        except Exception as e:
                return Response({"error": str(e)}, status=500)
        

