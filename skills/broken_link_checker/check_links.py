import os
import re
from pathlib import Path

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
        if not link.startswith('http') and not link.startswith('mailto:') and not link.startswith('tel:') and not link.startswith('#'):
            # Strip query parameters or fragments if they exist (e.g. file.css?v=1)
            clean_link = link.split('?')[0].split('#')[0]
            if clean_link:
                internal_links.append(clean_link)
    return set(internal_links)

def main():
    root_dir = Path("../../").resolve()
    
    html_files = list(root_dir.rglob("*.html")) + list(root_dir.rglob("*.htm"))
    
    broken_links_found = False
    
    print("Checking internal links in HTML files...")
    for html_file in html_files:
        if '.git' in html_file.parts or 'skills' in html_file.parts or '.trunk' in html_file.parts:
            continue
            
        links = get_internal_links_from_html(html_file)
        
        file_dir = html_file.parent
        
        for link in links:
            # Resolve path
            target_path = (file_dir / link).resolve()
            
            # Check if file exists
            if not target_path.exists():
                broken_links_found = True
                print(f"[!] Broken link in {html_file.relative_to(root_dir)}")
                print(f"    -> Cannot find: {link}")
                print(f"       (Resolved as: {target_path})")

    if not broken_links_found:
        print("Success! No broken internal links found.")

if __name__ == "__main__":
    main()
