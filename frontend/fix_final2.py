import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix `'0 8px 30px 'rgba(...)',` -> `'0 8px 30px rgba(...)',`
        content = re.sub(r" 'rgba\((.*?)\)'", r" rgba(\1)'", content)
        
        # Address `background: rgba(...)',` without leading quote
        content = re.sub(r"(?<!')rgba\(([^)]+)\)',", r"'rgba(\1)',", content)

        # Address `border: '1px solid rgba(...)',` if missing inner quotes - wait, that's already fine.
        
        # Make sure `rgba(something)'` without leading quote IS fixed
        # But maybe `border: 1px solid rgba(...)',`?
        content = re.sub(r"(?<!')rgba\(([^)]+)\)'", r"'rgba(\1)'", content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Final quotes fixed via comprehensive script.")
