function OpenInNewTab(url) {
    window.open(url, '_blank').focus();
}

document.addEventListener('DOMContentLoaded', async () => {
    const videoListContainer = document.getElementById('unity-shader-video-list');
    if (!videoListContainer) return;

    try {
        const dataRes = await fetch('../data/unity-shader-videos.json');
        const data = await dataRes.json();

        const itemTemplateRes = await fetch('../../partials/projects/unity-shader-video-item.html');
        const descTemplateRes = await fetch('../../partials/projects/unity-shader-video-desc.html');
        const bulletTemplateRes = await fetch('../../partials/projects/unity-shader-video-bullet.html');

        const itemTemplate = await itemTemplateRes.text();
        const descTemplate = await descTemplateRes.text();
        const bulletTemplate = await bulletTemplateRes.text();

        function parseLinks(text) {
            return text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="display: inline">$1</a>');
        }

        let html = '';
        data.forEach(item => {
            let descriptionHTML = '';
            
            if (item.title || item.bullets.length > 0) {
                let bulletsHTML = item.bullets.map(b => 
                    bulletTemplate.replace('{{bulletText}}', parseLinks(b))
                ).join('');
                
                let titleHTML = item.title ? `<h4 class="h3 timeline-item-title-h1">${item.title}</h4>` : '';
                
                descriptionHTML = descTemplate
                    .replace('{{titleHTML}}', titleHTML)
                    .replace('{{bullets}}', bulletsHTML);
            }

            html += itemTemplate
                .replace('{{descriptionHTML}}', descriptionHTML)
                .replace('{{videoSrc}}', item.videoSrc);
        });

        videoListContainer.innerHTML = html;
    } catch (e) {
        console.error('Failed to load unity shader videos', e);
    }
});
