async function fetchTemplate(path) {
    const res = await fetch(path);
    if (!res.ok) return '';
    return await res.text();
}

async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (!projectId) {
        document.getElementById('project-details-container').innerHTML = '<p>Project not found.</p>';
        return;
    }

    try {
        const response = await fetch('../data/project-details.json');
        const projects = await response.json();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            document.getElementById('project-details-container').innerHTML = '<p>Project not found.</p>';
            return;
        }

        // Update title
        document.title = `${project.title} - NguyenTienLong's Portfolio`;

        const [
            mainTemplateStr,
            exploreTemplateStr,
            timelineTemplateStr,
            videoTemplateStr,
            imageColTemplateStr,
            imageItemTemplateStr,
            lightboxTemplateStr
        ] = await Promise.all([
            fetchTemplate('../../partials/portfolio/portfolio_project-details.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-explore.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-timeline.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-video.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-image-col.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-image-item.html'),
            fetchTemplate('../../partials/portfolio/project-details/project-details-lightbox.html')
        ]);

        // Format the JSON data back into HTML using templates
        const formattedProject = {
            title: project.title,
            engine: project.engine,
            genre: project.genre,
            banner_html: project.banner ? `<div class="modal-image-banner"><div class="active"><img src="${project.banner}" loading="lazy" alt="Image"></div></div>` : '',
            
            about_text: (project.about || []).map(p => `<p>${p}</p>`).join('\n'),
            
            explore: (project.explore_links || []).map(link => {
                let html = exploreTemplateStr;
                html = html.replace(/\{\{link\}\}/g, link.link);
                html = html.replace(/\{\{label\}\}/g, link.label);
                return html;
            }).join('\n'),
            
            timeline: (project.timeline || []).map(item => {
                let html = timelineTemplateStr;
                html = html.replace(/\{\{title\}\}/g, item.title);
                
                const subtitleHtml = item.subtitle ? `<h4 class="h4 timeline-item-title">${item.subtitle}</h4>` : '';
                html = html.replace(/\{\{subtitle_html\}\}/g, subtitleHtml);
                
                const roleHtml = item.role ? `<span>${item.role}</span>` : '';
                html = html.replace(/\{\{role_html\}\}/g, roleHtml);
                
                const bulletsHtml = item.bullets.map(b => `<li>${b}</li>`).join('\n');
                html = html.replace(/\{\{bullets_html\}\}/g, bulletsHtml);
                
                return html;
            }).join('\n'),
                
            videos: project.videos && project.videos.length > 0 ? `
                <div class="modal-game-video" style="display: flex; justify-content: center; flex-wrap: wrap; flex-direction: row;">
                    ${project.videos.map(v => {
                        let html = videoTemplateStr;
                        html = html.replace(/\{\{src\}\}/g, v);
                        return html;
                    }).join('\n')}
                </div>` : '',
                
            images: (() => {
                const imgs = project.images || [];
                const colCount = 4;
                const cols = Array.from({length: colCount}, () => []);
                imgs.forEach((img, i) => cols[i % colCount].push(img));
                
                return cols.map(col => {
                    let colHtml = imageColTemplateStr;
                    const itemsHtml = col.map(img => {
                        let itemHtml = imageItemTemplateStr;
                        itemHtml = itemHtml.replace(/\{\{src\}\}/g, img);
                        return itemHtml;
                    }).join('');
                    colHtml = colHtml.replace(/\{\{items_html\}\}/g, itemsHtml);
                    return colHtml;
                }).join('');
            })()
        };

        let html = mainTemplateStr;
        for (const key in formattedProject) {
            // special handling for videos so we hide the HR if there are no videos
            if (key === 'videos') {
                if (!formattedProject[key]) {
                    html = html.replace(/\{\{videos\}\}\s*<br>\s*<hr class="half">\s*<br>/g, '');
                } else {
                    html = html.replace(/\{\{videos\}\}/g, formattedProject[key]);
                }
            } else {
                html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), formattedProject[key] || '');
            }
        }

        document.getElementById('project-details-container').innerHTML = html;

        // Inject lightbox from partial (only once)
        if (!document.getElementById('lightbox-overlay') && lightboxTemplateStr) {
            document.body.insertAdjacentHTML('beforeend', lightboxTemplateStr);
            initLightboxEvents();
        }
    } catch (e) {
        console.error(e);
        document.getElementById('project-details-container').innerHTML = '<p>Error loading project details.</p>';
    }
}

function OpenInNewTab(url) {
    window.open(url, '_blank').focus();
}

// ---- Lightbox ----

function initLightboxEvents() {
    const overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;

    // Close on overlay background click or close button
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('#lightbox-close')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(src) {
    const overlay = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-img');
    if (!overlay || !img) return;
    img.src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.addEventListener("DOMContentLoaded", loadProjectDetails);
