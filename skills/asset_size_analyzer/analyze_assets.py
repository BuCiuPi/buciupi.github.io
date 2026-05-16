import os
from pathlib import Path

def get_size_in_mb(file_path):
    return os.path.getsize(file_path) / (1024 * 1024)

def main():
    assets_dir = Path("../../assets").resolve()
    
    # 1MB threshold
    SIZE_THRESHOLD_MB = 1.0 
    
    large_assets = []
    
    for path in assets_dir.rglob("*"):
        if path.is_file():
            size_mb = get_size_in_mb(path)
            if size_mb >= SIZE_THRESHOLD_MB:
                large_assets.append((path.relative_to(assets_dir.parent), size_mb))
                
    large_assets.sort(key=lambda x: x[1], reverse=True)
    
    if large_assets:
        print(f"--- Assets larger than {SIZE_THRESHOLD_MB} MB ---")
        for asset, size in large_assets:
            print(f"{size:.2f} MB | {asset}")
    else:
        print(f"Great job! No assets larger than {SIZE_THRESHOLD_MB} MB found.")

if __name__ == "__main__":
    main()
