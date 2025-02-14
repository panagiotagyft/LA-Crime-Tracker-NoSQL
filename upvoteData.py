import json
import random
from faker import Faker
import pandas as pd 

faker = Faker()

# ---- 1. Load only DR_NO from crime_reports ----

output_police_officers = "police_officers.json"

# Load the CSV file with pandas
df = pd.read_csv("../Crime_Data_from_2020_to_Present_20241102.csv", dtype={"DR_NO": str})  # DR_NO is a string

# Get unique DR_NO values
dr_no_list = df["DR_NO"].tolist()

TOTAL_REPORTS = len(dr_no_list)
MIN_VOTED_REPORTS = TOTAL_REPORTS // 3  # 1/3 of the reports

# ---- 2. Generate police officers with unique badge_number & email ----

used_badge_numbers = set()
police_officers = []
used_reports = set()

i = 0
while True:

    while True:
        badge_number = str(random.randint(10000, 99999))
        email = faker.email()

        if badge_number not in used_badge_numbers:
            used_badge_numbers.add(badge_number)
            break

    police_officer = {
        "_id": f"officer_{i + 1}",
        "name": faker.name(),
        "email": email,
        "badge_number": badge_number,
        "votes": []
    }
    
    i += 1
    
    officer_votes = set()
    officer_votes_number = random.randint(1, 1000)

    for j in range(officer_votes_number):
        report_id = random.choice(dr_no_list)  # Select a random DR_NO

        if report_id not in officer_votes:
            officer_votes.add(report_id)
            used_reports.add(report_id)

        if len(used_reports) >= MIN_VOTED_REPORTS:
            break

    # **Properly update the "votes" field for the officer**
    police_officer["votes"] = [int(rid) for rid in officer_votes]

    # Add the officer to the list
    police_officers.append(police_officer)

    if len(used_reports) >= MIN_VOTED_REPORTS:
        break

# ---- 4. Save police_officers ----
with open(output_police_officers, "w") as f_officers:
    json.dump(police_officers, f_officers, indent=4)

print(f"✅ {len(police_officers)} police officers were created.")
print(f"✅ Total votes: {len(used_reports)} (without modifying crime_reports).")
