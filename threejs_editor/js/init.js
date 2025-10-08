// ================================================
// INIT SCRIPT - Carica automaticamente all'avvio
// ================================================

console.log('🔧 Inizializzazione editor avanzato...');

// Aspetta che app sia pronto
function waitForApp() {
    if (typeof window.app === 'undefined' || !window.app.uiManager) {
        setTimeout(waitForApp, 100);
        return;
    }
    
    initEditor();
}

function initEditor() {
    console.log('✅ App pronto, applico modifiche...');
    
    // 1. CARICA HOTSPOT QUANDO SELEZIONI PERCORSO
    document.getElementById('listaPercorsi').addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-action="select"]');
        if (!btn) return;
        
        const nome = btn.dataset.name;
        window.app.uiManager.percorsoCorrente = nome;
        
        const percorso = window.app.uiManager.percorsiAttivi[nome];
        if (percorso && percorso.hotspots) {
            window.app.uiManager.hotspotTemporanei = JSON.parse(JSON.stringify(percorso.hotspots));
            console.log('✅ Hotspot caricati:', Object.keys(window.app.uiManager.hotspotTemporanei).length, 'foto');
        }
        
        window.app.uiManager.aggiornaListaPercorsi();
        window.app.loadCurrentFoto();
    }, true);
    
    // 2. DISABILITA ANIMAZIONE PULSE
    window.app.hotspotManager.animatePulse = function() {};
    
    // 3. CARICA VISUAL EDITOR
    import('./visual-hotspot-editor.js').then(function(module) {
        window.app.visualEditor = new module.VisualHotspotEditor(
            window.app.engine.getScene(),
            window.app.engine.getCamera(),
            window.app.engine.getRenderer(),
            window.app.controls
        );
        
        // Callback salvataggio
        window.app.visualEditor.onApply = function(hotspotData) {
            const hotspots = window.app.uiManager.hotspotTemporanei[window.app.uiManager.currentFoto] || [];
            const index = hotspots.findIndex(h => h.timestamp === hotspotData.timestamp);
            if (index >= 0) {
                hotspots[index].position = hotspotData.position;
                if (hotspotData.scale) {
                    hotspots[index].scale = hotspotData.scale;
                }
                console.log('💾 Hotspot salvato:', hotspotData);
                window.app.uiManager.aggiornaListaHotspot();
            }
        };
        
        window.app.visualEditor.onAutoSave = function(hotspotData) {
            const hotspots = window.app.uiManager.hotspotTemporanei[window.app.uiManager.currentFoto] || [];
            const index = hotspots.findIndex(h => h.timestamp === hotspotData.timestamp);
            if (index >= 0) {
                hotspots[index].position = hotspotData.position;
                if (hotspotData.scale) {
                    hotspots[index].scale = hotspotData.scale;
                }
            }
        };
        
        // Fix camera bloccata durante editing
        const originalSelect = window.app.visualEditor.selectHotspot.bind(window.app.visualEditor);
        window.app.visualEditor.selectHotspot = function(mesh, data) {
            originalSelect(mesh, data);
            window.app.controls.enabled = false;
            if (!data.scale) data.scale = 1.0;
            mesh.scale.set(data.scale, data.scale, data.scale);
            console.log('🎯 Hotspot selezionato, camera bloccata');
        };
        
        const originalClose = window.app.visualEditor.close.bind(window.app.visualEditor);
        window.app.visualEditor.close = function() {
            window.app.controls.enabled = true;
            originalClose();
            console.log('✅ Editor chiuso, camera sbloccata');
        };
        
        // Rotellina per scala 0.1-2.0
        window.app.visualEditor.domElement.addEventListener('wheel', function(e) {
            if (!window.app.visualEditor.selectedHotspot) return;
            e.preventDefault();
            e.stopPropagation();
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const currentScale = window.app.visualEditor.selectedHotspot.scale.x;
            const newScale = Math.max(0.1, Math.min(2.0, currentScale + delta));
            
            window.app.visualEditor.selectedHotspot.scale.set(newScale, newScale, newScale);
            document.getElementById('scale-display').textContent = newScale.toFixed(2);
            window.app.visualEditor.autoSave();
        }, { passive: false, capture: true });
        
        // SHIFT+CLICK per aprire editor
        window.app.controls.onClick(function(event) {
            if (event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                
                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();
                const rect = window.app.engine.getRenderer().domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, window.app.engine.getCamera());
                
                const intersects = raycaster.intersectObjects(window.app.hotspotManager.getAll());
                
                if (intersects.length > 0) {
                    const hotspotData = window.app.uiManager.getHotspotsCorrente()[0];
                    if (hotspotData) {
                        window.app.visualEditor.selectHotspot(intersects[0].object, hotspotData);
                        console.log('🎯 Editor aperto!');
                    }
                }
                return;
            }
        });
        
        console.log('✅✅✅ TUTTO PRONTO! Usa SHIFT+CLICK per modificare hotspot');
    }).catch(err => {
        console.error('❌ Errore caricamento Visual Editor:', err);
    });
}

// Avvia inizializzazione
waitForApp();
