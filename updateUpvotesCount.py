from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor

client = MongoClient("mongodb://localhost:27017/")
db = client["NoSQL-LA-CRIME"]

pipeline = [
    {"$unwind": "$votes"},
    {"$group": {
        "_id": "$votes",
        "upvote_count": {"$sum": 1}
    }},
    {"$project": {
        "_id": 0,
        "dr_no": "$_id",
        "upvote_count": 1
    }}
]


upvote_counts = list(db.upvotes.aggregate(pipeline))


def update_crime_report(item, index):
    print(f"{index + 1}. {item}")
    db.crime_reports.update_one(
        {"dr_no": item["dr_no"]},
        {"$set": {"upvote_count": item["upvote_count"]}}
    )
    return item["dr_no"]


def update_with_threads(upvote_counts, max_threads=10):
    with ThreadPoolExecutor(max_threads) as executor:
        results = list(executor.map(update_crime_report, upvote_counts, range(len(upvote_counts))))
    return results


print(f"Starting the update for {len(upvote_counts)} records...")
updated_ids = update_with_threads(upvote_counts, max_threads=10)
print(f"Update completed for {len(updated_ids)} records!")

