import csv
import json
import pandas as pd
from datetime import datetime, date, time

csv_file = "../Crime_Data_from_2020_to_Present_20241102.csv"
json_file = "output_crime_reports2.json"

def parse_date(date_str):
    return pd.to_datetime(date_str, errors='coerce').date()

def parse_time(time_val):
    try:
        time_str = f"{int(time_val):04d}"
        return datetime.strptime(time_str, '%H%M').time()
    except:
        return None

def clean_document(document):
    fields_to_check = ["mocodes", "weapon"]
    victim_fields = ["age", "sex"]
    premises_fields = ["premis_cd"]
    location_fields = ["location", "cross_street"]

    for field in fields_to_check:
        if document.get(field) in [None, ""]:
            del document[field]

    for field in victim_fields:
        if document["victim"].get(field) in [None, ""]:
            del document["victim"][field]

    for field in premises_fields:
        if document["premises"].get(field) in [None, ""]:
            del document["premises"]

    for field in location_fields:
        if document["location"].get(field) in [None, ""]:
            del document["location"][field]

    return document

def process_row(row):
    document = {
        "dr_no": int(row["DR_NO"]),
        "date_rptd": parse_date(row["Date Rptd"]),
        "timestamp": {
            "date_occ": parse_date(row["DATE OCC"]),
            "time_occ": parse_time(row["TIME OCC"])
        },
        "area": {
            "area_id": row["AREA"],
            "area_name": row["AREA NAME"],
        },
        "rpt_dist_no": int(row["Rpt Dist No"]),
        "crime_codes": [
            {"crm_cd": int(row["Crm Cd"]), "crm_cd_desc": row["Crm Cd Desc"]} if row["Crm Cd"] else None,
            {"crm_cd": int(row["Crm Cd 2"]), "crm_cd_desc": row["Crm Cd Desc"]} if row["Crm Cd 2"] else None,
            {"crm_cd": int(row["Crm Cd 3"]), "crm_cd_desc": row["Crm Cd Desc"]} if row["Crm Cd 3"] else None,
            {"crm_cd": int(row["Crm Cd 4"]), "crm_cd_desc": row["Crm Cd Desc"]} if row["Crm Cd 4"] else None
        ],
        "mocodes": row["Mocodes"] if row["Mocodes"] else None,
        "victim": {
            "age": int(row["Vict Age"]) if row["Vict Age"] else None,
            "sex": row["Vict Sex"] if row["Vict Sex"] else None,
            "descent": row["Vict Descent"]
        },
        "premises": {
            "premis_cd": int(row["Premis Cd"]) if row["Premis Cd"] else None,
            "premis_desc": row["Premis Desc"]
        },
        "weapon": row["Weapon Desc"] if row["Weapon Desc"] else None,
        "status": row["Status Desc"],
        "location": {
            "location": row["LOCATION"] if row["LOCATION"] else None,
            "lat": float(row["LAT"]) if row["LAT"] else None,
            "lon": float(row["LON"]) if row["LON"] else None,
            "cross_street": row["Cross Street"] if row["Cross Street"] else None
        },
    }

    document["crime_codes"] = [code for code in document["crime_codes"] if code is not None]
    return clean_document(document)

def json_serial(obj):
    if isinstance(obj, (datetime, date, time)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

documents = []

with open(csv_file, mode="r") as file:
    csv_reader = csv.DictReader(file)

    for row in csv_reader:
        processed_doc = process_row(row)
        documents.append(processed_doc)

with open(json_file, mode="w") as json_out:
    json.dump(documents, json_out, indent=4, default=json_serial)

print(f"✅ The data has been saved to {json_file}")
