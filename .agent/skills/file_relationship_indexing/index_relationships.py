import os
import re
import json
from pathlib import Path

"""
File Relationship Indexing Skill (v2)

Indexes file relationships across:
- HTML files (href, src attributes)
- CSS files (url(), @import)
- JSON data files (asset paths in project data)

Outputs a markdown document mapping all internal and external dependencies.
"""

def get_links_from_html(file_path):
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', content)
        srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
        links.extend(hrefs)
        links.extend(srcs)
    return set(links)

def get_links_from_css(file_path):
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        urls = re.findall(r'url\([\'"]?([^\'"\)]+)[\'"]?\)', content)
        imports = re.findall(r'@import\s+[\'"]([^\'"]+)[\'"]', content)
        links.extend(urls)
        links.extend(imports)
    return set(links)

def get_links_from_json(file_path):
    """Extract paths from JSON data files."""
    links = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        data = json.load(f)
    
    def extract(obj):
        if isinstance(obj, str):
            if (obj.startswith('../') or obj.startswith('./')) and not obj.startswith('http'):
                links.append(obj)
            elif obj.startswith('http'):
                links.append(obj)
        elif isinstance(obj, list):
            for item in obj:
                extract(item)
        elif isinstance(obj, dict):
            for value in obj.values():
                extract(value)
    
    extract(data)
    return set(links)

def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    relationship_map = {}
    
    for path in root_dir.rglob("*"):
        if path.is_file() and '.git' not in path.parts and '.trunk' not in path.parts and '.idea' not in path.parts and 'skills' not in path.parts:
            ext = path.suffix.lower()
            rel_path = str(path.relative_to(root_dir)).replace("\\", "/")
            
            links = []
            if ext in ['.html', '.htm']:
                links = get_links_from_html(path)
            elif ext == '.css':
                links = get_links_from_css(path)
            elif ext == '.json' and 'data' in path.parts:
                links = get_links_from_json(path)
            
            if links:
                resolved_links = []
                for link in links:
                    if link.startswith('http') or link.startswith('mailto:') or link.startswith('tel:'):
                        resolved_links.append({"target": link, "type": "external"})
                    elif link.startswith('#'):
                        pass
                    else:
                        resolved_links.append({"target": link, "type": "internal"})
                
                if resolved_links:
                    relationship_map[rel_path] = resolved_links

    output_path = Path(__file__).parent / 'file_relationships.md'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# File Relationship Index\n\n")
        f.write("This document maps out the file dependencies within the project.\n")
        f.write("Includes HTML, CSS, and JSON data file references.\n\n")
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
            
    print(f"Created {output_path.name} successfully.")

if __name__ == "__main__":
    main()
