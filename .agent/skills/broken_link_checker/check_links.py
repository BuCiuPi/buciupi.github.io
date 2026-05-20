import os
import re
import json
from pathlib import Path

"""
Broken Link Checker Skill (v2)

Checks all internal links in:
- HTML files (href, src attributes)
- JSON data files (string values containing file paths)

Ensures all referenced local files actually exist on disk.
"""

def get_internal_links_from_html(file_path):
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', content)
        srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
        links.extend(hrefs)
        links.extend(srcs)
    
    # Filter only internal links
    internal_links = []
    for link in links:
        if not link.startswith('http') and not link.startswith('mailto:') and not link.startswith('tel:') and not link.startswith('#') and not link.startswith('data:'):
            clean_link = link.split('?')[0].split('#')[0]
            if clean_link:
                internal_links.append(clean_link)
    return set(internal_links)


def get_internal_links_from_json(file_path):
    """Extract file paths from JSON data files (images, videos, banners, etc.)."""
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        data = json.load(f)
    
    def extract_paths(obj):
        if isinstance(obj, str):
            # Match paths like ../images/..., ./assets/..., etc.
            if (obj.startswith('../') or obj.startswith('./')) and not obj.startswith('http'):
                clean = obj.split('?')[0].split('#')[0]
                if clean:
                    links.append(clean)
        elif isinstance(obj, list):
            for item in obj:
                extract_paths(item)
        elif isinstance(obj, dict):
            for value in obj.values():
                extract_paths(value)
    
    extract_paths(data)
    return set(links)


def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    
    broken_links_found = False
    
    # Check HTML files
    print("Checking internal links in HTML files...")
    html_files = list(root_dir.rglob("*.html")) + list(root_dir.rglob("*.htm"))
    for html_file in html_files:
        if '.git' in html_file.parts or 'skills' in html_file.parts or '.trunk' in html_file.parts:
            continue
            
        links = get_internal_links_from_html(html_file)
        file_dir = html_file.parent
        
        for link in links:
            target_path = (file_dir / link).resolve()
            if not target_path.exists():
                broken_links_found = True
                print(f"[!] Broken link in {html_file.relative_to(root_dir)}")
                print(f"    -> Cannot find: {link}")

    # Check JSON data files
    print("\nChecking internal links in JSON data files...")
    data_dir = root_dir / "assets" / "data"
    if data_dir.exists():
        for json_file in data_dir.glob("*.json"):
            links = get_internal_links_from_json(json_file)
            file_dir = json_file.parent
            
            for link in links:
                target_path = (file_dir / link).resolve()
                if not target_path.exists():
                    broken_links_found = True
                    print(f"[!] Broken link in {json_file.relative_to(root_dir)}")
                    print(f"    -> Cannot find: {link}")

    if not broken_links_found:
        print("\nSuccess! No broken internal links found.")

if __name__ == "__main__":
    main()
