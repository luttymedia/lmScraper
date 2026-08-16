import os
import sys
import ctypes
from PIL import Image

def generate_ico():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    png_path = os.path.join(project_dir, "frontend", "icon-512.png")
    ico_path = os.path.join(project_dir, "app_icon.ico")
    
    if os.path.exists(png_path):
        img = Image.open(png_path)
        sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        img.save(ico_path, sizes=sizes)
        img.save(os.path.join(project_dir, "icon.ico"), sizes=sizes)
        print(f"[OK] Generated icon file: {ico_path}")
    return ico_path

def create_shortcut():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    target_bat = os.path.join(project_dir, "start.bat")
    ico_path = generate_ico()
    shortcut_path = os.path.join(project_dir, "LMScraper.lnk")

    # Remove existing shortcut if exists to avoid stale cache
    if os.path.exists(shortcut_path):
        try:
            os.remove(shortcut_path)
        except Exception:
            pass

    ps_script = f'''
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{target_bat}"
$Shortcut.WorkingDirectory = "{project_dir}"
$Shortcut.IconLocation = "{ico_path},0"
$Shortcut.Description = "Launch LMScraper"
$Shortcut.Save()
'''
    import subprocess
    result = subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"[OK] Shortcut created successfully: {shortcut_path}")
    else:
        print(f"[ERROR] Failed to create shortcut: {result.stderr}")

    # Notify Windows Shell of association / icon changes
    try:
        # SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_IDLIST = 0x0000
        ctypes.windll.shell32.SHChangeNotify(0x08000000, 0x0000, None, None)
        print("[OK] Windows Shell icon cache refresh signal sent.")
    except Exception as e:
        print(f"[NOTE] Could not signal shell refresh: {e}")

if __name__ == "__main__":
    create_shortcut()
