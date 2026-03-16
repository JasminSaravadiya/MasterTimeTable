import sqlite3

def migrate():
    print("Connecting to database...")
    conn = sqlite3.connect('c:/MasterTimeTable/backend/timetable.db')
    c = conn.cursor()

    print("Adding ignore_collision column to faculties table...")
    try:
        c.execute("ALTER TABLE faculties ADD COLUMN ignore_collision BOOLEAN DEFAULT 0")
        print("Column added successfully.")
    except Exception as e:
        print("Error (Column might already exist):", e)

    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
