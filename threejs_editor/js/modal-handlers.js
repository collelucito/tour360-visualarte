// AGGIUNGI QUESTE FUNZIONI A app.js
// Inserire dopo la funzione cancelHotspot()

// ==================== GESTIONE MODAL CHIEDI (MP4) ====================
window.conferm aChiedi = function() {
    const video = document.getElementById('chiediVideoSelect').value;
    const audio = document.getElementById('chiediAudioSelect').value;
    const gallery = [];
    document.querySelectorAll('#chiediImagesCheckboxes input:checked').forEach(cb => {
        gallery.push(cb.value);
    });
    
    if (!video && !audio && gallery.length === 0) {
        alert('Seleziona almeno un contenuto!');
        return;
    }
    
    const position = window.app.uiManager.pendingHotspot.position;
    const hotspot = window.app.uiManager.aggiungiHotspot(position);
    hotspot.content = {
        video: video,
        audio: audio,
        gallery: gallery
    };
    
    const pos = new THREE.Vector3(position.x, position.y, position.z);
    window.app.hotspotManager.createHotspot(pos, 'chiedi', {
        timestamp: hotspot.timestamp,
        content: hotspot.content
    });
    
    document.getElementById('modalChiedi').classList.remove('active');
    window.app.uiManager.pendingHotspot = null;
};

window.annullaChiedi = function() {
    document.getElementById('modalChiedi').classList.remove('active');
    window.app.uiManager.pendingHotspot = null;
};

// ==================== GESTIONE MODAL MORE ====================
window.confermaMore = function() {
    const titolo = document.getElementById('moreTitleInput').value.trim();
    const testo = document.getElementById('moreTextInput').value.trim();
    const wikipedia = document.getElementById('moreWikipediaInput').value.trim();
    
    if (!titolo && !testo) {
        alert('Inserisci almeno un titolo o del testo!');
        return;
    }
    
    const position = window.app.uiManager.pendingHotspot.position;
    const hotspot = window.app.uiManager.aggiungiHotspot(position);
    hotspot.content = {
        titolo: titolo,
        testo: testo,
        wikipedia: wikipedia
    };
    
    const pos = new THREE.Vector3(position.x, position.y, position.z);
    window.app.hotspotManager.createHotspot(pos, 'more', {
        timestamp: hotspot.timestamp,
        content: hotspot.content
    });
    
    document.getElementById('modalMore').classList.remove('active');
    window.app.uiManager.pendingHotspot = null;
};

window.annullaMore = function() {
    document.getElementById('modalMore').classList.remove('active');
    window.app.uiManager.pendingHotspot = null;
};
