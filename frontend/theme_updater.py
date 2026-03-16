import os
import re

ROOT_DIR = r"c:\MasterTimeTable\frontend\src\components"

COLOR_MAP = {
    # Backgrounds
    r"linear-gradient\(135deg,\s*#0a0e1a\s*0%,\s*#0f1629\s*40%,\s*#131b33\s*100%\)": "'#ECE7D1'",
    r"linear-gradient\(160deg,\s*#151c32\s*0%,\s*#111827\s*100%\)": "'#DBCEA5'",
    r"rgba\(255,255,255,0\.02\)": "'#DBCEA5'",
    r"rgba\(255,255,255,0\.03\)": "'#DBCEA5'",
    r"rgba\(255,255,255,0\.04\)": "'#DBCEA5'",
    r"rgba\(0,0,0,0\.15\)": "'#ECE7D1'",
    r"rgba\(0,0,0,0\.2\)": "'#FFFFFF'",
    r"rgba\(0,0,0,0\.3\)": "'#FFFFFF'",
    
    # Primary gradients & colors
    r"linear-gradient\(135deg,\s*#6366f1,\s*#8b5cf6\)": "'#8A7650'",
    r"linear-gradient\(135deg,\s*#818cf8,\s*#a78bfa\)": "'#8A7650'",
    r"linear-gradient\(135deg,\s*#e0e7ff,\s*#c7d2fe,\s*#a5b4fc\)": "'#8A7650'",
    r"#6366f1": "#8A7650",
    r"#8b5cf6": "#8E977D",
    r"#818cf8": "#8A7650",
    r"#c7d2fe": "#8A7650",
    r"rgba\(99,102,241,0\.08\)": "'#DBCEA5'",
    r"rgba\(99,102,241,0\.06\)": "'#DBCEA5'",
    r"rgba\(99,102,241,0\.2\)": "'#8E977D'",
    r"rgba\(99,102,241,0\.35\)": "'rgba(138,118,80,0.35)'",
    r"rgba\(99,102,241,0\.5\)": "'#8A7650'",
    r"rgba\(99,102,241,0\.4\)": "'#8A7650'",
    r"rgba\(99,102,241,0\.3\)": "'rgba(138,118,80,0.3)'",
    r"rgba\(99,102,241,0\.1\)": "'rgba(138,118,80,0.1)'",
    r"rgba\(99,102,241,0\.15\)": "'rgba(138,118,80,0.15)'",
    
    # Text colors
    r"'#fff'": "'#2B2B2B'",
    r"'#ffffff'": "'#2B2B2B'",
    r"'#e2e8f0'": "'#2B2B2B'",
    r"'#f8fafc'": "'#2B2B2B'",
    r"'#64748b'": "'#5A5A5A'",
    r"'#94a3b8'": "'#5A5A5A'",
    r"'#475569'": "'#5A5A5A'",
    r"'#334155'": "'#5A5A5A'",
    
    # Borders
    r"rgba\(255,255,255,0\.06\)": "'#DBCEA5'",
    r"rgba\(255,255,255,0\.08\)": "'#DBCEA5'",
    r"rgba\(255,255,255,0\.1\)": "'#DBCEA5'",
    r"'1px solid rgba\(255,255,255,0\.1\)'": "'1px solid #DBCEA5'",
    r"'1px solid rgba\(255,255,255,0\.06\)'": "'1px solid #DBCEA5'",
    r"'1px solid rgba\(255,255,255,0\.08\)'": "'1px solid #DBCEA5'",
    
    # Orbs (can make them subtle primary/secondary)
    r"rgba\(99,102,241,0\.12\)": "rgba(138,118,80,0.12)",
    r"rgba\(16,185,129,0\.10\)": "rgba(142,151,125,0.10)",
    r"#10b981": "#8E977D",

    # Break section
    r"rgba\(245,158,11,0\.04\)": "'#DBCEA5'",
    r"rgba\(245,158,11,0\.12\)": "'#DBCEA5'",
    r"rgba\(245,158,11,0\.15\)": "'rgba(138,118,80,0.15)'",
    r"'#fbbf24'": "'#8A7650'",
    
    # Modal background backdrop
    r"rgba\(0,0,0,0\.65\)": "'rgba(43,43,43,0.5)'",
}

# MasterGrid specific Tailwind Classes Replacements
TAILWIND_MAP = {
    # Backgrounds
    r"bg-slate-900/80": "bg-[#ECE7D1]",
    r"bg-slate-900/40": "bg-[#DBCEA5]",
    r"bg-slate-900": "bg-themeBg",
    r"bg-slate-800/80": "bg-[#DBCEA5]",
    r"bg-slate-800/60": "bg-[#DBCEA5]",
    r"bg-slate-800/50": "bg-[#DBCEA5]",
    r"bg-slate-800/30": "bg-[#DBCEA5]/50",
    r"bg-slate-800": "bg-themeSurface",
    r"bg-slate-700/40": "bg-themeSecondary/40",
    r"bg-slate-700": "bg-themePrimary",
    r"hover:bg-slate-800": "hover:bg-themeSurface",
    r"hover:bg-slate-700": "hover:bg-themePrimary",
    r"hover:bg-slate-600": "hover:bg-themeSecondary",
    r"bg-blue-600": "bg-themePrimary",
    r"hover:bg-blue-500": "hover:bg-themeSecondary",
    r"bg-emerald-600": "bg-themePrimary",
    r"hover:bg-emerald-500": "hover:bg-themeSecondary",
    
    # Text
    r"text-slate-200": "text-themeTextMain",
    r"text-slate-300": "text-themeTextMain",
    r"text-slate-400": "text-themeTextMuted",
    r"text-slate-500": "text-themeTextMuted",
    r"text-white": "text-white", # Or change to text-themeTextMain? White is fine for primary btns
    r"text-blue-400": "text-themePrimary",
    r"text-emerald-400": "text-themeSecondary",
    r"text-blue-100": "text-themeTextMain",
    
    # Borders
    r"border-slate-700/50": "border-themeSurface",
    r"border-slate-700": "border-themeSurface",
    r"border-slate-600": "border-themePrimary",
    
    # Specifics for slot allocation boxes
    r"bg-blue-900/40": "bg-[#ECE7D1]",
    r"border-blue-500/50": "border-themePrimary",
    r"border-blue-500/20": "border-themePrimary/50",
}


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply inline style replacements
    for pattern, replacement in COLOR_MAP.items():
        content = re.sub(pattern, replacement, content)

    # Apply Tailwind class replacements
    for pattern, replacement in TAILWIND_MAP.items():
        # Only replace whole words for tailwind classes to avoid partial matches
        # but pattern includes slashes, so \b might not work perfectly around slashes.
        # We can just standard replace because they are fairly unique.
        content = content.replace(pattern, replacement)

    # In MasterGrid, fix specific elements requested
    # Grid Header: bg-themePrimary instead of bg-themeSurface
    content = content.replace('thead className="bg-themeSurface', 'thead className="bg-themePrimary')
    # Update text to white if background is primary
    content = content.replace('text-emerald-400 uppercase', 'text-white uppercase')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filename in os.listdir(ROOT_DIR):
    if filename.endswith(".tsx"):
        process_file(os.path.join(ROOT_DIR, filename))

print("Theme updated successfully.")
