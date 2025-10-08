// ========================================
// AUTO-LOAD SCRIPT - Carica automaticamente
// ========================================
console.log('🔧 Caricamento auto-script...');

// 1. Carica hotspot quando selezioni percorso
document.getElementById('listaPercorsi').addEventListener('click', function(e) {
    var btn = e.target.closest('button[data-action="select"]');
    if (!btn) return;
    
    var nome = btn.dataset.name;
    window.app.uiManager.percorsoCorrente = nome;
    
    var percorso = window.app.uiManager.percorsiAttivi[nome];
    if (percorso && percorso.hotspots) {
        window.app.uiManager.hotspotTemporanei = JSON.parse(JSON.stringify(percorso.hotspots));
        console.log('✅ Hotspot caricati:', Object.keys(window.app.uiManager.hotspotTemporanei).length, 'foto');
    }
    
    window.app.uiManager.aggiornaListaPercorsi();
    window.app.loadCurrentFoto();
}, true);

// 2. Disabilita animazione pulse
window.app.hotspotManager.animatePulse = function() {};

// 3. Carica Visual Editor
import('./visual-hotspot-editor.js').then(function(module) {
    window.app.visualEditor = new module.VisualHotspotEditor(
        window.app.engine.getScene(),
        window.app.engine.getCamera(),
        window.app.engine.getRenderer(),
        window.app.controls
    );
    
    // Callback salvataggio
    window.app.visualEditor.onApply = function(hd) {
        var hs = window.app.uiManager.hotspotTemporanei[window.app.uiManager.currentFoto] || [];
        var i = hs.findIndex(function(h) { return h.timestamp === hd.timestamp; });
        if (i >= 0) {
            hs[i].position = hd.position;
            if (hd.scale) hs[i].scale = hd.scale;
            window.app.uiManager.aggiornaListaHotspot();
            console.log('💾 Salvato:', hd);
        }
    };
    
    window.app.visualEditor.onAutoSave = function(hd) {
        var hs = window.app.uiManager.hotspotTemporanei[window.app.uiManager.currentFoto] || [];
        var i = hs.findIndex(function(h) { return h.timestamp === hd.timestamp; });
        if (i >= 0) {
            hs[i].position = hd.position;
            if (hd.scale) hs[i].scale = hd.scale;
        }
    };
    
    // Fix camera + scala
    var origSelect = window.app.visualEditor.selectHotspot.bind(window.app.visualEditor);
    window.app.visualEditor.selectHotspot = function(mesh, data) {
        origSelect(mesh, data);
        window.app.controls.enabled = false;
        if (!data.scale) data.scale = 1.0;
        mesh.scale.set(data.scale, data.scale, data.scale);
    };
    
    var origClose = window.app.visualEditor.close.bind(window.app.visualEditor);
    window.app.visualEditor.close = function() {
        window.app.controls.enabled = true;
        origClose();
    };
    
    // Rotellina 0.1-2.0
    window.app.visualEditor.domElement.addEventListener('wheel', function(e) {
        if (!window.app.visualEditor.selectedHotspot) return;
        e.preventDefault();
        e.stopPropagation();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        var newScale = Math.max(0.1, Math.min(2.0, window.app.visualEditor.selectedHotspot.scale.x + delta));
        window.app.visualEditor.selectedHotspot.scale.set(newScale, newScale, newScale);
        document.getElementById('scale-display').textContent = newScale.toFixed(2);
        window.app.visualEditor.autoSave();
    }, { passive: false, capture: true });
    
    // SHIFT+CLICK per aprire editor
    window.app.controls.onClick(function(event) {
        if (event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2();
            var rect = window.app.engine.getRenderer().domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, window.app.engine.getCamera());
            var intersects = raycaster.intersectObjects(window.app.hotspotManager.getAll());
            if (intersects.length > 0) {
                var hotspotData = window.app.uiManager.getHotspotsCorrente()[0];
                window.app.visualEditor.selectHotspot(intersects[0].object, hotspotData);
            }
            return;
        }
    });
    
    console.log('✅ TUTTO PRONTO! SHIFT+CLICK per modificare hotspot');
});
