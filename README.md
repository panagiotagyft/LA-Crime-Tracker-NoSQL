# Entity-Relationship Diagram (E/R)

## Entities

### `crime_reports`
- `_id` (ObjectId) - Primary Key
- `dr_no` (Integer) - Unique crime report number
- `date_rptd` (Date) - Date the crime was reported
- `timestamp`
  - `date_occ` (Date) - Date the crime occurred
  - `time_occ` (Time) - Time the crime occurred
- `area`
  - `area_id` (Integer) - Area identifier
  - `area_name` (String) - Name of the area
- `rpt_dist_no` (Integer) - Report district number
- `crime_codes` (Array of `CrimeCode`)
  - `crm_cd` (Integer) - Crime code identifier
  - `crm_cd_desc` (String) - Crime description
- `mocodes` (String) - Modus operandi codes
- `victim`
  - `age` (Integer) - Age of the victim
  - `sex` (String) - Sex of the victim
  - `descent` (String) - Victim's descent
- `premises`
  - `premis_cd` (Integer) - Premises code
  - `premis_desc` (String) - Description of premises
- `weapon` (String) - Weapon used
- `status` (String) - Status of the investigation
- `location`
  - `location` (String) - Address
  - `lat` (Float) - Latitude
  - `lon` (Float) - Longitude
- `upvote_count` (Integer) - Number of upvotes received

### `upvotes`
- `_id` (String) - Primary Key (e.g., "officer_1")
- `name` (String) - Officer's name
- `email` (String) - Officer's email
- `badge_number` (Integer) - Unique badge number
- `votes` (Array of `dr_no` references) - List of `CrimeReport.dr_no` that the officer has upvoted

## Relationships

1. **`crime_reports` ↔ `upvotes` (M:N Relationship)**
   - An officer can upvote multiple crime reports.
   - A crime report can receive upvotes from multiple officers.
   - This is represented by the `votes` array in `Officer`, which contains `dr_no` values from `CrimeReport`.

---

### Diagram Representation

