# My_Claim
Internship

## Database Management

This project includes scripts to export and import the MongoDB database for easier collaboration and migration.

### Exporting Database
To export the current database to JSON files:
```bash
cd backend
node export_db.js
```
The data will be saved in `backend/database_dump/`.

### Importing Database
To import the data from the dump back into your local MongoDB:
```bash
cd backend
node import_db.js
```
**Warning:** This will overwrite any existing data in the corresponding collections.
