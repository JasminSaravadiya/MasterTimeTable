import os

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace("px 'rgba", "px rgba")
        content = content.replace("solid 'rgba", "solid rgba")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Targeted quotes fixed.")
