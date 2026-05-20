---
name: project_page_generator
description: Adds new projects or games to the portfolio. It registers project details in assets/data/project-details.json and listing cards in assets/data/projects.json.
---
# Project Page Generator Skill

Use this skill to register new projects and details on the developer's portfolio website.

## Setup
The generator runs as a Python script and modifies the JSON databases used dynamically by the portfolio pages.

## Execution
Run the project generation script with:
```bash
python skills/project_page_generator/generate_project.py [config.json]
```

Run it without arguments to generate a sample configuration template.
