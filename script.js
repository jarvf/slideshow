const root = document.getElementById('slideshow_container');
function setStatus(msg){ root.innerHTML = `<div class="status">${msg}</div>`; }
setStatus('Loading slideshow…');