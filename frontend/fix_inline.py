import os

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

BROKEN_STRINGS = [
    ("'1px solid '#DBCEA5''", "'1px solid #DBCEA5'"),
    ("'0 10px 32px '#8A7650''", "'0 10px 32px #8A7650'"),
    ("''rgba(43,43,43,0.5)'", "'rgba(43,43,43,0.5)'"),
    ("''rgba(138,118,80,0.15)'", "'rgba(138,118,80,0.15)'"),
    ("''#8A7650''", "'#8A7650'"),
    ("'0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px '#DBCEA5''", "'0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px #DBCEA5'"),
    ("''rgba(138,118,80,0.35)'", "'rgba(138,118,80,0.35)'"),
    ("''rgba(138,118,80,0.3)'", "'rgba(138,118,80,0.3)'"),
    ("''rgba(138,118,80,0.1)'", "'rgba(138,118,80,0.1)'"),
    ("'0 6px 24px 'rgba(138,118,80,0.35)''", "'0 6px 24px rgba(138,118,80,0.35)'"),
    ("'0 8px 30px 'rgba(138,118,80,0.3)''", "'0 8px 30px rgba(138,118,80,0.3)'"),
    ("`bg-gradient-to-r ${slot.isBreak ? 'from-amber-500/15 to-orange-500/15 border-amber-500/25' : SLOT_COLORS[idx % SLOT_COLORS.length]}`", "SLOT_COLORS[idx % SLOT_COLORS.length]"), # Simplify this while we are at it
]

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        filepath = os.path.join(ROOT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        for old, new in BROKEN_STRINGS:
            content = content.replace(old, new)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Inline quotes fixed.")
