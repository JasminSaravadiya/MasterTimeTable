import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # e.g. '0 6px 24px 'rgba(138,118,80,0.35)',
        content = re.sub(r"'([^']+?)'rgba\(([^)]+)\)',", r"'\1rgba(\2)',", content)
        content = re.sub(r"'([^']+?)'rgba\(([^)]+)\)'", r"'\1rgba(\2)'", content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Inline quotes fixed again.")
