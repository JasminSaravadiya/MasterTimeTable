import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace ''#HEX'' with '#HEX'
    content = re.sub(r"''(#\w+)''", r"'\1'", content)
    # Replace 'rgba(...)'' with 'rgba(...)'
    content = re.sub(r"'rgba([^']+?)''", r"'rgba\1'", content)
    # Replace ''rgba(...)'' with 'rgba(...)'
    content = re.sub(r"''rgba([^']+?)''", r"'rgba\1'", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        process_file(os.path.join(ROOT_DIR, filename))

print("Syntax fixed successfully.")
