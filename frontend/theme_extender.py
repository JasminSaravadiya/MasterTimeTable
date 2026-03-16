import os
import re

ROOT = r"c:\MasterTimeTable\frontend\src\components"

def update_file(filename, replacements):
    path = os.path.join(ROOT, filename)
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Configuration.tsx 
config_replacements = [
    # glassCard -> Card Background (Subject, Faculty, Room panels)
    ("background: '#DBCEA5',", "background: '#F4F0DF',"),
    ("border: '1px solid #DBCEA5',", "border: '1px solid #C9BE9A',"),
    ("borderRadius: 16,", "borderRadius: 14,\n  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',"),
    
    # inputStyle
    ("borderRadius: 10,", "borderRadius: 8,"),
    ("background: 'rgba(0,0,0,0.25)',", "background: '#FFFFFF',"),
    ("background: 'rgba(255,255,255,0.05)',", "background: '#FFFFFF',"),
    
    # btnPrimary -> Primary Button
    ("padding: '8px 16px',", "padding: '10px 18px',"),
    ("background: '#8A7650',", "background: 'linear-gradient(#8A7650, #756341)',"),
    ("boxShadow: '0 4px 16px rgba(99,102,241,0.25)',", "boxShadow: '0 2px 6px rgba(0,0,0,0.15)',"),
    
    # Colors updating to new standard
    ("color: '#2B2B2B'", "color: '#2F2A1F'"),
    ("color: '#5A5A5A'", "color: '#5E5642'"),
    
    # Modal Header background in Configuration (the delete confirm modal)
    # The delete modal is: background: '#1e293b' (Wait, it was missed in earlier theme styling!)
    ("background: '#1e293b',", "background: '#F4F0DF',"),
    
    # Other hardcoded bg replacements in Configuration
    ("background: 'linear-gradient(135deg, #1e1b4b, #312e81)',", "background: '#F4F0DF',"), # drag overlay
    ("border: '1px solid #8A7650',", "border: '1px solid #C9BE9A',"),
    
    # Fix the iconBtnStyle background to be secondary accent or surface
    # Wait, iconBtnStyle bg is '#DBCEA5' currently. Let's make it standard:
    ("background: '#DBCEA5',\n  color: '#5E5642',", "background: '#F4F0DF',\n  color: '#5E5642',"),
]
update_file("Configuration.tsx", config_replacements)

# 2. MasterGrid.tsx (Timetable Grid Visibility & Modals)
grid_replacements = [
    ("bg-themeBg", "bg-[#ECE7D1]"),
    ("bg-themeSurface", "bg-[#DBCEA5]"),
    ("bg-themePrimary", "bg-[#8A7650]"),
    ("bg-[#DBCEA5]", "bg-[#F4F0DF]"), # The Grid Container used DBCEA5, now F4F0DF
    
    # Timetable Grid visibility: "Day column should look distinct"
    # Existing Day th: className="border-r border-themeSurface p-3 min-w-[60px] bg-themeBg z-30 sticky left-0 shadow-sm"
    ('border-themeSurface', 'border-[#B8AC86]'), # Grid lines
    ('border-collapse', 'border-collapse border border-[#B8AC86]'),
    
    # Update all manual Tailwind borders
    ('border-b border-themeSurface', 'border-b border-[#B8AC86]'),
    ('border-r border-themeSurface', 'border-r border-[#B8AC86]'),
    
    # Modals in MasterGrid
    ('bg-[#DBCEA5]', 'bg-[#F4F0DF]'),
]
update_file("MasterGrid.tsx", grid_replacements)

# 3. Dashboard.tsx (Action Buttons, Modals)
dash_replacements = [
    # The setup form (Cards)
    ("borderRight: '1px solid #DBCEA5'", "borderRight: '1px solid #C9BE9A'"),
    # Buttons
    ("background: '#8A7650'", "background: 'linear-gradient(#8A7650, #756341)'"),
    ("boxShadow: '0 8px 30px rgba(138,118,80,0.3)'", "boxShadow: '0 2px 6px rgba(0,0,0,0.15)'"),
    ("padding: '16px 32px'", "padding: '10px 18px'"),
    
    ("background: '#DBCEA5'", "background: '#F4F0DF'"), # Make inner cards F4F0DF
    
    ("color: '#2B2B2B'", "color: '#2F2A1F'"),
    ("color: '#5A5A5A'", "color: '#5E5642'"),
    
    # The actual dashboard bg is currently 'radial-gradient(...)' or '#ECE7D1'
    # Actually wait, Dashboard.tsx uses '#ECE7D1'
]
update_file("Dashboard.tsx", dash_replacements)

# 4. ExportPopup.tsx & ExportPreview.tsx
export_replacements = [
    # Export Preview Modal still uses old dark theme
    ("bg-slate-900", "bg-[#ECE7D1]"),
    ("bg-slate-800", "bg-[#F4F0DF]"),
    ("border-slate-700", "border-[#C9BE9A]"),
    ("text-slate-300", "text-[#5E5642]"),
    ("text-white", "text-[#2F2A1F]"),
    
    # Tabs
    # Inactive:
    ("text-slate-400 hover:text-white hover:bg-slate-800", "text-[#5E5642] bg-[#DBCEA5] hover:bg-[#C9BE9A]"),
    # Active:
    ("bg-blue-600 text-white", "bg-[#8A7650] text-white"),
    ("bg-blue-500", "bg-[#8A7650]"),
    ("hover:bg-blue-700", "hover:bg-[#756341]"),
]
update_file("ExportPopup.tsx", export_replacements)
update_file("ExportPreview.tsx", export_replacements)

print("Baseline script replacements completed")
