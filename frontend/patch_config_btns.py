import os

ROOT = r"c:\MasterTimeTable\frontend\src\components"
path = os.path.join(ROOT, "Configuration.tsx")

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Next button
text = text.replace(
    "style={{ ...btnPrimary, width: '100%', padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg, #8E977D, #059669)' }}", 
    "className=\"btn-primary\" style={{ width: '100%', padding: '12px 0', borderRadius: 12 }}"
)
# Re-replace just in case it was modified before
text = text.replace(
    "style={{ ...btnPrimary, width: '100%', padding: '12px 0', borderRadius: 12, background: 'linear-gradient(#8A7650, #756341)' }}", 
    "className=\"btn-primary\" style={{ width: '100%', padding: '12px 0', borderRadius: 12 }}"
)

# Add subject button
text = text.replace(
    "style={{ ...btnPrimary, fontSize: 12, padding: '8px 14px' }}",
    "className=\"btn-primary\" style={{ fontSize: 12, padding: '8px 14px' }}"
)

# Add Branch
text = text.replace(
    "style={{ ...iconBtnStyle, background: 'rgba(138,118,80,0.15)', color: '#8A7650', fontWeight: 700, fontSize: 16, flexShrink: 0 }}",
    "className=\"btn-primary\" style={{ ...iconBtnStyle, background: '', color: '', fontWeight: 700, fontSize: 16, flexShrink: 0 }}"
)

# Add Faculty
text = text.replace(
    "style={{ ...iconBtnStyle, background: 'rgba(138,118,80,0.15)', color: '#8A7650', fontWeight: 700, fontSize: 16, height: 30, width: 30, flexShrink: 0 }}",
    "className=\"btn-primary\" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 30, width: 30, flexShrink: 0 }}"
)

# Add Room uses same pattern as Faculty, the previous replace should catch it if they are identical. Or wait, let's just do a string literal replace for Add Faculty/Room lines:
# they both use `style={{ ...iconBtnStyle, background: 'rgba(138,118,80,0.15)', color: '#8A7650', fontWeight: 700, fontSize: 16, height: 30, width: 30, flexShrink: 0 }}`
text = text.replace(
    "style={{ ...iconBtnStyle, background: 'rgba(138,118,80,0.15)', color: '#8A7650', fontWeight: 700, fontSize: 16, height: 30, width: 30, flexShrink: 0 }}",
    "className=\"btn-primary\" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 30, width: 30, borderRadius: 8, padding: 0 }}"
)

# We should also replace btnPrimary definition in Configuration.tsx, actually wait, we can just leave it as it doesn't break anything. 

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Buttons patched in Configuration.tsx")
