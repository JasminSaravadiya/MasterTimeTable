import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'timetable.db')
conn = sqlite3.connect(db_path)

tables = ['faculties', 'rooms', 'branches', 'semesters']
for t in tables:
    res = conn.execute(f"SELECT sql FROM sqlite_master WHERE type='table' and name='{t}'").fetchone()
    if res:
        print(res[0])
        
    indexes = conn.execute(f"SELECT sql FROM sqlite_master WHERE type='index' and tbl_name='{t}'").fetchall()
    for idx in indexes:
        if idx[0]:
            print(idx[0])

conn.close()
