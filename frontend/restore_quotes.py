import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find `rgba(something)'` without a preceding quote and add a quote at the start.
        content = re.sub(r"(?<!')rgba\(([^)]+)\)'", r"'rgba(\1)'", content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Quotes restored.")
