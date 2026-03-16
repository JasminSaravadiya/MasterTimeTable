import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix `'0 8px 30px 'rgba(...)',` -> `'0 8px 30px rgba(...)',`
        content = content.replace(" 'rgba(", " rgba(")
        
        # Just in case `''rgba(`
        content = content.replace("''rgba(", "'rgba(")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Final quotes fixed.")
