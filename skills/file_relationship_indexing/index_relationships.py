import os
import re
import json
from pathlib import Path

def get_links_from_html(file_path):
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
        # Match href="..." or href='...'
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', content)
        # Match src="..." or src='...'
        srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
        
        links.extend(hrefs)
        links.extend(srcs)
    return set(links)

def get_links_from_css(file_path):
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
        # Match url(...)
        urls = re.findall(r'url\([\'"]?([^\'"\)]+)[\'"]?\)', content)
        # Match @import "..."
        imports = re.findall(r'@import\s+[\'"]([^\'"]+)[\'"]', content)
        
        links.extend(urls)
        links.extend(imports)
    return set(links)

def main():
    root_dir = Path(".")
    relationship_map = {}
    
    for path in root_dir.rglob("*"):
        if path.is_file() and not '.git' in path.parts and not '.trunk' in path.parts and not '.idea' in path.parts:
            ext = path.suffix.lower()
            rel_path = str(path.relative_to(root_dir)).replace("\\", "/")
            
            links = []
            if ext in ['.html', '.htm']:
                links = get_links_from_html(path)
            elif ext == '.css':
                links = get_links_from_css(path)
            
            if links:
                resolved_links = []
                for link in links:
                    if link.startswith('http') or link.startswith('mailto:') or link.startswith('tel:'):
                        resolved_links.append({"target": link, "type": "external"})
                    elif link.startswith('#'):
                        pass # Internal page anchor
                    else:
                        resolved_links.append({"target": link, "type": "internal"})
                
                if resolved_links:
                    relationship_map[rel_path] = resolved_links

    # Write to markdown
    with open('file_relationships.md', 'w', encoding='utf-8') as f:
        f.write("# File Relationship Index\n\n")
        f.write("This document maps out the file dependencies within the project.\n\n")
        for source, targets in sorted(relationship_map.items()):
            f.write(f"### `{source}`\n")
            for target in sorted(targets, key=lambda x: (x['type'], x['target'])):
                t = target['target']
                type_ = target['type']
                if type_ == 'internal':
                    f.write(f"- [Internal] `{t}`\n")
                else:
                    f.write(f"- [External] {t}\n")
            f.write("\n")
            
    print("Created file_relationships.md successfully.")

if __name__ == "__main__":
    main()
