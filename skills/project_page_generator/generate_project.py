import json
import os
from pathlib import Path

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} Details - NguyenTienLong's Portfolio</title>
    <link rel="shortcut icon" href="../images/logo.ico" type="image/x-icon">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <main>
        <div class="main-content">
            <article class="about active" style="padding: 15px; max-width: 1000px; margin: auto;">
                <header>
                    <h2 class="h2 article-title">{title}</h2>
                </header>

                <div class="blog-meta">
                    <p class="blog-category">{engine}</p>
                    <span class="dot"></span>
                    <p>{genre}</p>
                </div>
                <br><hr class="half"><br>

                <div class="about-text">
                    <p>{description_1}</p>
                    <p>{description_2}</p>
                </div>
                <br><hr class="half"><br>

                <div class="modal-image-banner">
                    <div class="active">
                        <img src="../images/GameImage/{folder}/{banner_image}" loading="lazy" alt="Banner Image">
                    </div>
                </div>

                <div class="modal-explore">
                    <button class="link-btn" onclick="OpenInNewTab('{play_link}')">
                        <ion-icon name="paper-plane" role="img" class="md hydrated" aria-label="paper plane"></ion-icon>
                        <span>Play</span>
                    </button>
                    <button class="link-btn" onclick="OpenInNewTab('{explore_link}')">
                        <ion-icon name="paper-plane" role="img" class="md hydrated" aria-label="paper plane"></ion-icon>
                        <span>Explore More..</span>
                    </button>
                </div>
                <br><hr><br>
                <section class="timeline">
                    <div class="title-wrapper">
                        <div class="icon-box"><ion-icon name="book-outline"></ion-icon></div>
                        <h3 class="h3">{title}</h3>
                    </div>
                    <!-- Timeline details can be filled manually -->
                </section>
            </article>
        </div>
    </main>

    <script>
        function OpenInNewTab(url) {
            window.open(url, '_blank').focus();
        }
    </script>
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
</body>
</html>
"""

def generate_page(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    output_html = TEMPLATE.format(
        title=data.get('title', 'Project Title'),
        engine=data.get('engine', 'Unity Engine'),
        genre=data.get('genre', 'Genre'),
        description_1=data.get('description_1', 'Project Description 1'),
        description_2=data.get('description_2', 'Project Description 2'),
        folder=data.get('image_folder', 'SelfProject'),
        banner_image=data.get('banner_image', 'banner.jpg'),
        play_link=data.get('play_link', '#'),
        explore_link=data.get('explore_link', '#')
    )
    
    file_name = data.get('title').lower().replace(' ', '-') + '.html'
    output_path = Path("../../assets/projects") / file_name
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_html)
        
    print(f"Generated new project page: {output_path.resolve()}")

if __name__ == "__main__":
    sample_config = Path("sample_config.json")
    if not sample_config.exists():
        with open(sample_config, 'w', encoding='utf-8') as f:
            json.dump({
                "title": "New Awesome Game",
                "engine": "Unity Engine",
                "genre": "Puzzle, Casual",
                "description_1": "This is a new awesome game.",
                "description_2": "I made this game as a self learning project.",
                "image_folder": "SelfProject",
                "banner_image": "banner.jpg",
                "play_link": "https://example.com/play",
                "explore_link": "https://example.com/explore"
            }, f, indent=4)
        print("Created sample_config.json. Modify it and run the script again to generate the page.")
    else:
        generate_page(sample_config)
