import json
import os
from pathlib import Path

"""
Project Page Generator Skill (v2 - Data-Driven)

This skill adds a new project to the portfolio by:
1. Adding an entry to assets/data/project-details.json (project content)
2. Adding an entry to assets/data/projects.json (portfolio listing card)

No standalone HTML files are generated — everything uses the shared
project-details.html template that dynamically loads from JSON.

Usage:
  1. Create a config JSON file (see sample_config.json for format)
  2. Run: python generate_project.py <config_file.json>
  3. Or run without args to generate a sample_config.json template
"""

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DETAILS_PATH = ROOT_DIR / "assets" / "data" / "project-details.json"
PROJECTS_PATH = ROOT_DIR / "assets" / "data" / "projects.json"


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Updated: {path.relative_to(ROOT_DIR)}")


def generate_project(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    project_id = config.get('id')
    if not project_id:
        print("Error: 'id' field is required in config.")
        return

    # --- 1. Add to project-details.json ---
    details = load_json(PROJECT_DETAILS_PATH)

    # Check for duplicate
    if any(p.get('id') == project_id for p in details):
        print(f"Warning: Project '{project_id}' already exists in project-details.json. Skipping.")
    else:
        detail_entry = {
            "id": project_id,
            "title": config.get("title", "New Project"),
            "engine": config.get("engine", "Unity Engine"),
            "genre": config.get("genre", ""),
            "banner": config.get("banner", ""),
            "timeline": config.get("timeline", []),
            "videos": config.get("videos", []),
            "images": config.get("images", []),
            "about": config.get("about", []),
            "explore_links": config.get("explore_links", [])
        }
        details.append(detail_entry)
        save_json(PROJECT_DETAILS_PATH, details)

    # --- 2. Add to projects.json ---
    projects = load_json(PROJECTS_PATH)

    if any(p.get('modalId') == project_id for p in projects):
        print(f"Warning: Project '{project_id}' already exists in projects.json. Skipping.")
    else:
        card_entry = {
            "category": config.get("category", "game"),
            "modalId": project_id,
            "link": f"./assets/projects/project-details.html?id={project_id}",
            "image": config.get("card_image", ""),
            "imageStyle": config.get("card_image_style", ""),
            "imageAlt": project_id,
            "tech": config.get("engine", "Unity"),
            "tags": config.get("tags", ""),
            "title": config.get("title", "New Project"),
            "description": config.get("card_description", "")
        }
        projects.append(card_entry)
        save_json(PROJECTS_PATH, projects)

    print(f"\nProject '{project_id}' added successfully!")
    print(f"View at: project-details.html?id={project_id}")


def create_sample_config():
    sample = {
        "id": "my-new-game",
        "title": "My New Game",
        "category": "game",
        "engine": "Unity Engine",
        "genre": "Puzzle, Casual",
        "tags": "Puzzle, Casual",
        "banner": "../images/GameImage/SelfProject/banner.jpg",
        "card_image": "./assets/images/GameImage/SelfProject/thumbnail.gif",
        "card_image_style": "",
        "card_description": "A short description for the portfolio card.",
        "about": [
            "First paragraph about the project.",
            "Second paragraph about your role."
        ],
        "timeline": [
            {
                "title": "GamePlay Details",
                "subtitle": "",
                "role": "",
                "bullets": [
                    "Gameplay detail 1",
                    "Gameplay detail 2"
                ]
            },
            {
                "title": "Main Responsibility",
                "subtitle": "Unity, WebGL, Mobile",
                "role": "UI/UX, Gameplay",
                "bullets": [
                    "Responsibility 1",
                    "Responsibility 2"
                ]
            }
        ],
        "videos": [],
        "images": [
            "../images/GameImage/SelfProject/screenshot1.png",
            "../images/GameImage/SelfProject/screenshot2.png"
        ],
        "explore_links": [
            {
                "link": "https://example.com/play",
                "label": "Play Now"
            }
        ]
    }

    sample_path = Path(__file__).parent / "sample_config.json"
    with open(sample_path, 'w', encoding='utf-8') as f:
        json.dump(sample, f, indent=4, ensure_ascii=False)
    print(f"Created {sample_path.name}")
    print("Edit it with your project data, then run:")
    print(f"  python {Path(__file__).name} {sample_path.name}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        config_file = Path(sys.argv[1])
        if not config_file.exists():
            print(f"Error: Config file '{config_file}' not found.")
        else:
            generate_project(config_file)
    else:
        create_sample_config()
