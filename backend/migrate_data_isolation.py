import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'timetable.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    print("Dropping existing globally unique indexes...")
    indexes_to_drop = [
        "ix_faculties_name",
        "ix_rooms_name",
        "ix_branches_name"
    ]

    for idx in indexes_to_drop:
        try:
            c.execute(f"DROP INDEX IF EXISTS {idx}")
            print(f"Successfully dropped index {idx}")
        except Exception as e:
            print(f"Error dropping {idx}: {e}")

    # Recreate as standard non-unique indexes since we still query by name often
    try:
        c.execute("CREATE INDEX IF NOT EXISTS ix_faculties_name ON faculties (name)")
        c.execute("CREATE INDEX IF NOT EXISTS ix_rooms_name ON rooms (name)")
        c.execute("CREATE INDEX IF NOT EXISTS ix_branches_name ON branches (name)")
        print("Successfully created standard non-unique indexes.")
    except Exception as e:
        print(f"Error recreating indexes: {e}")

    conn.commit()
    conn.close()
    print("Migration finished securely.")

if __name__ == "__main__":
    migrate()
